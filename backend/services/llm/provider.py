from .base import BaseLLMService
from dotenv import load_dotenv
import os
from .groq import GroqLLMService
from typing import Annotated
from fastapi import Depends

load_dotenv()


def get_llm_service() -> BaseLLMService:
    provider = os.getenv("LLM_PROVIDER")

    match provider:
        case "groq":
            return GroqLLMService()
        case _:
            raise ValueError(f"Unsupported LLM provider: {provider}")


LLMServiceDep = Annotated[BaseLLMService, Depends(get_llm_service)]
