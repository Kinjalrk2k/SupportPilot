from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    thread_id: str  # Crucial: Tells Redis which user's memory to load
    order_id: str
    messages: list[ChatMessage]
