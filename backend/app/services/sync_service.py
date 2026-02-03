import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.moodle_client import MoodleClient
from app.models.course import Course
from app.models.assignment import Assignment
from app.models.resource import Resource
from datetime import datetime, timezone

class SyncService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.moodle = MoodleClient()

    async def sync_all(self):
        """Main sync function - fetches and updates all data"""
        print(f"[{datetime.now()}] Starting sync...")

        # 1. Sync courses
        courses = await self.moodle.get_user_courses()

        # Check for Moodle API error
        if isinstance(courses, dict) and 'exception' in courses:
            error_msg = courses.get('message', 'Unknown Moodle API error')
            raise Exception(f"Moodle API error: {error_msg}")

        print(f"[DEBUG] Fetched {len(courses)} courses")
        await self._sync_courses(courses)

        # 2. Sync assignments
        course_ids = [c['id'] for c in courses]
        print(f"[DEBUG] Course IDs: {course_ids}")
        assignments_data = await self.moodle.get_assignments(course_ids)
        print(f"[DEBUG] Assignments API response type: {type(assignments_data)}")
        print(f"[DEBUG] Assignments API response keys: {assignments_data.keys() if isinstance(assignments_data, dict) else 'Not a dict'}")
        if isinstance(assignments_data, dict) and 'courses' in assignments_data:
            print(f"[DEBUG] Number of courses with assignments: {len(assignments_data['courses'])}")
            for course in assignments_data['courses']:
                if 'assignments' in course:
                    print(f"[DEBUG] Course {course.get('id')} has {len(course['assignments'])} assignments")
        await self._sync_assignments(assignments_data)

        # 3. Sync resources (files)
        for course in courses:
            contents = await self.moodle.get_course_contents(course['id'])
            await self._sync_resources(course['id'], contents)

        await self.db.commit()
        print(f"[{datetime.now()}] Sync completed!")

    async def _sync_courses(self, courses_data: list):
        """Sync courses to database"""
        for course_data in courses_data:
            stmt = select(Course).where(Course.moodle_id == course_data['id'])
            result = await self.db.execute(stmt)
            existing = result.scalar_one_or_none()

            if existing:
                existing.fullname = course_data.get('fullname', '')
                existing.progress = course_data.get('progress', 0)
                existing.updated_at = datetime.utcnow()
            else:
                course = Course(
                    moodle_id=course_data['id'],
                    fullname=course_data.get('fullname', ''),
                    shortname=course_data.get('shortname', ''),
                    category_id=course_data.get('category'),
                    progress=course_data.get('progress', 0)
                )
                self.db.add(course)

    async def _sync_assignments(self, assignments_data: dict):
        """Sync assignments to database"""
        if 'courses' not in assignments_data:
            return

        # Flatten assignments list to process concurrently
        all_assignments = []
        for course in assignments_data['courses']:
            if 'assignments' in course:
                for assign in course['assignments']:
                    # Add course_id to assignment object for easy access
                    assign['course_id'] = course['id']
                    all_assignments.append(assign)

        # Batch fetch submission statuses concurrently
        # We use get_assignment_status which works for students (unlike get_submissions)
        # running them in parallel is much faster than sequential
        
        # Limit concurrency to 5 to avoid overwhelming Moodle
        semaphore = asyncio.Semaphore(5)

        async def fetch_with_semaphore(assign_id):
            async with semaphore:
                return await self.moodle.get_assignment_status(assign_id)

        tasks = [fetch_with_semaphore(a['id']) for a in all_assignments]
        if tasks:
            print(f"[DEBUG] Fetching statuses for {len(tasks)} assignments...")
            # Limit concurrency to avoid overwhelming the server or hitting limits
            # Since MoodleClient creates a new session per call, we should be careful.
            # However, asyncio.gather with ~50 tasks is usually fine.
            results = await asyncio.gather(*tasks, return_exceptions=True)
        else:
            results = []

        submission_status_map = {}
        grade_map = {}
        for assign, result in zip(all_assignments, results):
            is_submitted = False
            grade = None
            
            if isinstance(result, Exception):
                print(f"[ERROR] Failed to fetch status for assignment {assign['id']}: {result}")
            elif isinstance(result, dict):
                 if 'exception' in result:
                     print(f"[ERROR] Moodle API error for assignment {assign['id']}: {result}")
                 
                 # Check if there's a submission with status "submitted" (individual or team)
                 last_attempt = result.get('lastattempt', {})
                 sub_status = last_attempt.get('submission', {}).get('status')
                 team_status = last_attempt.get('teamsubmission', {}).get('status')
                 
                 # Consider 'graded' as submitted as well
                 if sub_status in ['submitted', 'graded'] or team_status in ['submitted', 'graded']:
                     is_submitted = True
                 elif sub_status or team_status:
                     print(f"[DEBUG] Assignment {assign['id']} has status: sub={sub_status}, team={team_status}")
                 
                 # DEBUG: Trace specific assignments
                 if assign['id'] in [13033, 13744]:
                     print(f"[TRACE] Assign {assign['id']}: sub_status='{sub_status}', team_status='{team_status}', is_submitted={is_submitted}")

                 # Extract grade
                 feedback = result.get('feedback', {})
                 grade_display = feedback.get('gradefordisplay')
                 if grade_display:
                     # Clean up HTML entities
                     grade = grade_display.replace('&nbsp;', ' ').strip()
            
            submission_status_map[assign['id']] = is_submitted
            grade_map[assign['id']] = grade

        # Update DB
        for assign_data in all_assignments:
            stmt = select(Assignment).where(Assignment.moodle_id == assign_data['id'])
            result = await self.db.execute(stmt)
            existing = result.scalar_one_or_none()

            due_date = None
            if assign_data.get('duedate'):
                due_date = datetime.fromtimestamp(assign_data['duedate'], tz=timezone.utc).replace(tzinfo=None)

            # Get submission status and grade from maps
            submitted = submission_status_map.get(assign_data['id'], False)
            grade = grade_map.get(assign_data['id'])

            if not existing:
                assignment = Assignment(
                    moodle_id=assign_data['id'],
                    cmid=assign_data.get('cmid'),  # Store course module ID
                    course_id=assign_data['course_id'],
                    name=assign_data.get('name', ''),
                    due_date=due_date,
                    description=assign_data.get('intro', ''),
                    is_new=True,
                    submitted=submitted,
                    grade=grade
                )
                self.db.add(assignment)
            else:
                # Update existing assignment's fields (including due_date which may change)
                existing.submitted = submitted
                existing.grade = grade
                existing.cmid = assign_data.get('cmid')
                existing.due_date = due_date
                existing.name = assign_data.get('name', '')
                existing.description = assign_data.get('intro', '')
                existing.updated_at = datetime.utcnow()

    async def _sync_resources(self, course_id: int, contents: list):
        """Sync course resources (files) to database"""
        for module in contents:
            if 'modules' not in module:
                continue

            section_name = module.get('name', 'General')

            for mod in module['modules']:
                if 'contents' not in mod:
                    continue

                for content in mod['contents']:
                    if content.get('type') != 'file':
                        continue

                    file_url = content.get('fileurl', '')
                    if not file_url:
                        continue

                    stmt = select(Resource).where(Resource.file_url == file_url)
                    result = await self.db.execute(stmt)
                    existing = result.scalar_one_or_none()

                    if not existing:
                        resource = Resource(
                            moodle_id=content.get('id', 0),
                            course_id=course_id,
                            filename=content.get('filename', 'unknown'),
                            file_url=file_url,
                            section=section_name,
                            mimetype=content.get('mimetype', ''),
                            filesize=content.get('filesize', 0),
                            time_created=datetime.fromtimestamp(content['timecreated'], tz=timezone.utc).replace(tzinfo=None) if content.get('timecreated') else None,
                            is_new=True
                        )
                        self.db.add(resource)
                    elif existing.section != section_name:
                        # Update section if changed
                        existing.section = section_name
