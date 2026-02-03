import httpx
import asyncio
import os

async def test_connection():
    # Load env vars manually
    env_vars = {}
    try:
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    except FileNotFoundError:
        print("Error: .env file not found")
        return

    moodle_url = env_vars.get('MOODLE_URL')
    token = env_vars.get('MOODLE_TOKEN')
    user_id = env_vars.get('MOODLE_USER_ID')

    if not all([moodle_url, token, user_id]):
        print("Error: Missing Moodle credentials in .env")
        return

    base_url = f"{moodle_url}/webservice/rest/server.php"
    print(f"Testing connection to: {base_url}")
    
    params = {
        "wstoken": token,
        "wsfunction": "core_enrol_get_users_courses",
        "moodlewsrestformat": "json",
        "userid": user_id
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if isinstance(data, dict) and 'exception' in data:
                print(f"Moodle API Error: {data['message']}")
                print(f"Error Code: {data['errorcode']}")
            elif isinstance(data, list):
                print(f"Success! Found {len(data)} courses.")
            else:
                print(f"Unexpected response format: {type(data)}")
                print(data)

    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
