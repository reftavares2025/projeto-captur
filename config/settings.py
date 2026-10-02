from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Captur Webhook API"
    API_PORT: int = 8000
    DATABASE_URL: str
    REDIS_URL: str

    EVOLUTION_API_URL: str
    EVOLUTION_GLOBAL_API_KEY: str

    CHATWOOT_API_URL: str
    CHATWOOT_API_ACCESS_TOKEN: str
    CHATWOOT_ACCOUNT_ID: int = 1
    CHATWOOT_INBOX_ID: int = 1

    class Config:
        env_file = ".env"

settings = Settings()
