from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Moodle
    moodle_url: str
    moodle_token: str
    moodle_user_id: int

    # Database
    database_url: str

    # Scheduler
    sync_schedule_cron: str = "0 4 * * *"

    class Config:
        env_file = ".env"

settings = Settings()
