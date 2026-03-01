from pydantic import BaseModel
from uuid import UUID
from models.enums.message import MessageRole
from datetime import datetime

class MessageResponse(BaseModel):
    id: UUID
    role: MessageRole
    content: str
    created_at: datetime