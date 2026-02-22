from config.db import SessionDep
from uuid import UUID
from models.all import Conversation
from sqlalchemy import select
from typing import Annotated
from fastapi import Depends


class ConversationRepository:
    db: SessionDep

    def __init__(self, db: SessionDep):
        self.db = db

    def get_by_id(self, conversation_id: UUID) -> Conversation:
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        return self.db.scalar(stmt)

    def create(self) -> Conversation:
        conversation = Conversation()
        self.db.add(conversation)
        self.db.flush()
        return conversation


def get_conversation_repository(
    db: SessionDep,
) -> ConversationRepository:
    return ConversationRepository(db)


ConversationRepositoryDep = Annotated[
    ConversationRepository, Depends(get_conversation_repository)
]
