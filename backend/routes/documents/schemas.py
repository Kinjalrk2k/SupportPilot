from pydantic import BaseModel, Field
from typing import List

# --- Pydantic Schemas for API Responses ---


class StandardResponse(BaseModel):
    message: str


class DocumentListResponse(BaseModel):
    documents: list[str]
