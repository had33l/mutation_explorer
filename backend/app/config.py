import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Changed from http://localhost:11434/v1 to http://localhost:11434/v1/ (or let OpenAI append it)
    # The most robust format for OpenAI Client targeting local Ollama is: http://localhost:11434/v1
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434/v1")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")
    NCBI_EMAIL: str = os.getenv("NCBI_EMAIL", "had33l.lajnef@gmail.com")

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()