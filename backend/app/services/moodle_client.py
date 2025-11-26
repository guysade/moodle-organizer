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
            return response.json()

    async def get_user_courses(self) -> List[Dict]:
        """Fetch all enrolled courses"""
        return await self._call("core_enrol_get_users_courses", userid=self.user_id)

    async def get_course_contents(self, course_id: int) -> List[Dict]:
        """Fetch course contents (modules, resources)"""
        return await self._call("core_course_get_contents", courseid=course_id)

    async def get_assignments(self, course_ids: List[int]) -> List[Dict]:
        """Fetch assignments for multiple courses"""
        return await self._call("mod_assign_get_assignments", courseids=course_ids)
