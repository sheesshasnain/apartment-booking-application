from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://booking_user:change_me@db:3306/apartment_booking"
    secret_key: str = "CHANGE_THIS_SECRET_KEY_IN_ENV"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
