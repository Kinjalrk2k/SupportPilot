from fastapi import Depends
from services.chat_service import ChatService
from services.groq_llm import GroqLLMService
from dependencies.repository import (
    get_conversation_repository,
    get_message_repository,
)
from repository.conversation import ConversationRepository
from repository.message import MessageRepository


def get_groq_llm_service() -> GroqLLMService:
    return GroqLLMService()


def get_chat_service(
    conversation_repo: ConversationRepository = Depends(get_conversation_repository),
    message_repo: MessageRepository = Depends(get_message_repository),
    llm: GroqLLMService = Depends(get_groq_llm_service),
) -> ChatService:
    return ChatService(conversation_repo, message_repo, llm)
