import asyncio
import os
from datetime import datetime, timedelta
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleMoodleClient:
    def __init__(self):
        self.moodle_url = os.getenv("MOODLE_URL")
        self.token = os.getenv("MOODLE_TOKEN")
        self.user_id = os.getenv("MOODLE_USER_ID")
        
        if not self.moodle_url or not self.token:
            raise ValueError("Missing MOODLE_URL or MOODLE_TOKEN in .env")
            
        self.base_url = f"{self.moodle_url}/webservice/rest/server.php"

    async def _call(self, wsfunction: str, **params):
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

async def main():
    print("Checking Moodle Calendar for exams...")
    
    try:
        client = SimpleMoodleClient()
    except ValueError as e:
        print(f"Configuration Error: {e}")
        return
    
    # Time range: now to 6 months from now
    now = int(datetime.now().timestamp())
    future = int((datetime.now() + timedelta(days=180)).timestamp())
    
    try:
        response = await client._call(
            "core_calendar_get_calendar_events",
            options={
                "userevents": 1,
                "siteevents": 1,
                "timestart": now,
                "timeend": future
            }
        )
        
        events = response.get('events', [])
        print(f"Fetched {len(events)} events from calendar.")
        
        exam_keywords = ['exam', 'midterm', 'final', 'test', 'quiz', 'מבחן', 'בוחן', 'moed', 'מועד']
        found_exams = []
        
        print("\n--- Potential Exams Found ---")
        for event in events:
            name = event.get('name', '').lower()
            if any(k in name for k in exam_keywords):
                found_exams.append(event)
                date_str = datetime.fromtimestamp(event['timestart']).strftime('%Y-%m-%d %H:%M')
                print(f"[{date_str}] {event['name']}")
                print(f"   Course: {event.get('course', {}).get('fullname', 'Unknown Course')}")
                print(f"   Description: {event.get('description', 'No description')[:100]}...")
                print("-" * 30)
        
        if not found_exams:
            print("No events matching exam keywords were found.")
            
    except Exception as e:
        print(f"Error fetching calendar: {e}")

if __name__ == "__main__":
    asyncio.run(main())