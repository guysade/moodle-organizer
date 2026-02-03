import httpx
from typing import List, Dict, Any
from app.config import settings

class MoodleClient:
    def __init__(self):
        self.base_url = f"{settings.moodle_url}/webservice/rest/server.php"
        self.token = settings.moodle_token
        self.user_id = settings.moodle_user_id

    async def _call(self, wsfunction: str, **params) -> Any:
        """Make async API call to Moodle"""
        payload = {
            "wstoken": self.token,
            "wsfunction": wsfunction,
            "moodlewsrestformat": "json",
            **params
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(self.base_url, params=payload)
            response.raise_for_status()
            data = response.json()
            # Check for Moodle API errors (invalid token, permission denied, etc.)
            if isinstance(data, dict) and 'exception' in data:
                print(f"[MOODLE API ERROR] {wsfunction}: {data.get('message', data)}")
            return data

    async def get_user_courses(self) -> List[Dict]:
        """Fetch all enrolled courses"""
        return await self._call("core_enrol_get_users_courses", userid=self.user_id)

    async def get_course_contents(self, course_id: int) -> List[Dict]:
        """Fetch course contents (modules, resources)"""
        return await self._call("core_course_get_contents", courseid=course_id)

    async def get_assignments(self, course_ids: List[int]) -> Dict:
        """Fetch assignments for multiple courses"""
        # Moodle API expects courseids[0]=id1&courseids[1]=id2 format
        params = {f"courseids[{i}]": cid for i, cid in enumerate(course_ids)}
        return await self._call("mod_assign_get_assignments", **params)

    async def get_assignment_status(self, assignment_id: int) -> Dict:
        """Fetch submission status for an assignment"""
        try:
            return await self._call("mod_assign_get_submission_status",
                                   assignid=assignment_id,
                                   userid=self.user_id)
        except Exception as e:
            # If we can't get status, log and return empty dict
            print(f"[MOODLE ERROR] get_assignment_status({assignment_id}): {type(e).__name__}: {e}")
            return {}

    async def get_submissions(self, assignment_ids: List[int]) -> Dict:
        """Fetch submissions for multiple assignments"""
        params = {f"assignmentids[{i}]": aid for i, aid in enumerate(assignment_ids)}
        return await self._call("mod_assign_get_submissions", **params)
