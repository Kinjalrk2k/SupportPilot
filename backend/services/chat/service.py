from config.db import SessionDep
from repository.conversation_repository import ConversationRepository
from repository.message_repository import MessageRepository
from uuid import UUID
from typing import Optional
from models.all import MessageRole
from langchain.messages import HumanMessage, AIMessage
from services.llm.groq import GroqLLMService
from repository.conversation_repository import ConversationRepositoryDep
from repository.message_repository import MessageRepositoryDep
from services.llm.provider import LLMServiceDep
from services.llm.base import BaseLLMService
from typing import Annotated
from fastapi import Depends
from dataclasses import dataclass
from .dtos import ChatResult
from .exceptions import ConversationNotFoundExpection
from utils.chat_history import db_messages_to_history


class ChatService:
    conversation_repo: ConversationRepository
    message_repo: MessageRepository
    llm: GroqLLMService

    def __init__(
        self,
        conversation_repo: ConversationRepository,
        message_repo: MessageRepository,
        llm: BaseLLMService,
    ):

        self.conversation_repo = conversation_repo
        self.message_repo = message_repo
        self.llm = llm

    def chat(self, conversation_id: Optional[UUID], message: str) -> ChatResult:
        if not conversation_id:  # new conversation
            conversation = self.conversation_repo.create()
        else:  # ongoing conversation
            conversation = self.conversation_repo.get_by_id(conversation_id)
            if not conversation:
                raise ConversationNotFoundExpection(
                    f"Conversation {conversation_id} not found"
                )

        # history of messages
        messages = self.message_repo.get_by_conversation_id(conversation_id)
        history = db_messages_to_history(messages)
        history.append(HumanMessage(content=message))

        # agent
        agent_response = self.llm.generate_reply(history)

        # create the user message in database
        self.message_repo.create(
            conversation_id=conversation.id, role=MessageRole.user, content=message
        )

        # create the agent message in database
        self.message_repo.create(
            conversation_id=conversation.id,
            role=MessageRole.assistant,
            content=agent_response.content,
        )

        return ChatResult(conversation_id=conversation.id, reply=agent_response.content)

    def stream_chat(self, conversation_id: Optional[UUID], message: str):
        if not conversation_id:  # new conversation
            conversation = self.conversation_repo.create()
        else:  # ongoing conversation
            conversation = self.conversation_repo.get_by_id(conversation_id)
            if not conversation:
                raise ConversationNotFoundExpection(
                    f"Conversation {conversation_id} not found"
                )

        # history of messages
        messages = self.message_repo.get_by_conversation_id(conversation_id)
        history = db_messages_to_history(messages)
        history.append(HumanMessage(content=message))

        # stream
        def generator():
            full_response = ""

            for token in self.llm.stream_reply(history):
                full_response += token
                yield token

            # create the user message in database
            self.message_repo.create(
                conversation_id=conversation.id, role=MessageRole.user, content=message
            )

            # create the agent message in database
            self.message_repo.create(
                conversation_id=conversation.id,
                role=MessageRole.assistant,
                content=full_response,
            )

        return conversation.id, generator()


def get_chat_service(
    conversation_repo: ConversationRepositoryDep,
    message_repo: MessageRepositoryDep,
    llm: LLMServiceDep,
) -> ChatService:
    return ChatService(conversation_repo, message_repo, llm)


ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]
