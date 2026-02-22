from config.db import SessionDep
from uuid import UUID
from models.all import Conversation
from sqlalchemy import select


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
