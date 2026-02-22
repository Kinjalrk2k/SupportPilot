from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class ChatResult:
    conversation_id: UUID
    reply: str
