from config.db import SessionDep
from repository.conversation import ConversationRepository
from repository.message import MessageRepository


def get_conversation_repository(
    db: SessionDep,
) -> ConversationRepository:
    return ConversationRepository(db)


def get_message_repository(
    db: SessionDep,
) -> MessageRepository:
    return MessageRepository(db)