from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://redis:6379/0"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    FARMER_REFRESH_TOKEN_EXPIRE_DAYS: int = 90
    OTP_DEV_MODE: bool = True
    OTP_EXPIRE_MINUTES: int = 5
    OTP_MAX_ATTEMPTS: int = 5
    GEMINI_API_KEY: str = ""
    APP_NAME: str = "KrishiMind"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
