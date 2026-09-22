from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    foundry_local_model: str = "phi-3.5-mini-instruct-cuda-gpu"
    database_url: str = "sqlite:///./itibar_tespit.db"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    scraper_timeout: int = 30
    scraper_user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    scraper_rate_limit_delay: float = 2.0
    scraper_max_retries: int = 3

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
