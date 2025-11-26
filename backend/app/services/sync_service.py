from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.moodle_client import MoodleClient
from app.models.course import Course
from app.models.assignment import Assignment
from app.models.resource import Resource
from datetime import datetime

class SyncService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.moodle = MoodleClient()

    async def sync_all(self):
        """Main sync function - fetches and updates all data"""
        print(f"[{datetime.now()}] Starting sync...")

        # 1. Sync courses
        courses = await self.moodle.get_user_courses()
        await self._sync_courses(courses)

        # 2. Sync assignments
        course_ids = [c['id'] for c in courses]
        assignments_data = await self.moodle.get_assignments(course_ids)
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

        for course in assignments_data['courses']:
            if 'assignments' not in course:
                continue

            for assign_data in course['assignments']:
                stmt = select(Assignment).where(Assignment.moodle_id == assign_data['id'])
                result = await self.db.execute(stmt)
                existing = result.scalar_one_or_none()

                due_date = None
                if assign_data.get('duedate'):
                    due_date = datetime.fromtimestamp(assign_data['duedate'])

                if not existing:
                    assignment = Assignment(
                        moodle_id=assign_data['id'],
                        course_id=course['id'],
                        name=assign_data.get('name', ''),
                        due_date=due_date,
                        description=assign_data.get('intro', ''),
                        is_new=True
                    )
                    self.db.add(assignment)

    async def _sync_resources(self, course_id: int, contents: list):
        """Sync course resources (files) to database"""
        for module in contents:
            if 'modules' not in module:
                continue

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
                            mimetype=content.get('mimetype', ''),
                            filesize=content.get('filesize', 0),
                            time_created=datetime.fromtimestamp(content['timecreated']) if content.get('timecreated') else None,
                            is_new=True
                        )
                        self.db.add(resource)
