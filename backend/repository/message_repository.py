from config.db import SessionDep
from uuid import UUID
from models.all import MessageRole, Message
from sqlalchemy import select
from typing import Annotated
from fastapi import Depends


class MessageRepository:
    def __init__(self, db: SessionDep):
        self.db = db

    def create(self, conversation_id: UUID, role: MessageRole, content: str) -> Message:
        message = Message(conversation_id=conversation_id, role=role, content=content)
        self.db.add(message)
        self.db.flush()
        return message

    def get_by_conversation_id(self, conversation_id: UUID) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        return list(self.db.scalars(stmt))


def get_message_repository(
    db: SessionDep,
) -> MessageRepository:
    return MessageRepository(db)


MessageRepositoryDep = Annotated[MessageRepository, Depends(get_message_repository)]
