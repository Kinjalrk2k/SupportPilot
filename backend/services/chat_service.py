from config.db import SessionDep
from repository.conversation_repository import ConversationRepository
from repository.message_repository import MessageRepository
from uuid import UUID
from typing import Optional
from models.all import MessageRole
from langchain.messages import HumanMessage, AIMessage
from services.groq_llm import GroqLLMService
from repository.conversation_repository import ConversationRepositoryDep
from repository.message_repository import MessageRepositoryDep
from services.groq_llm import GroqLLMServiceDep
from typing import Annotated
from fastapi import Depends
from dataclasses import dataclass


class ConversationNotFoundExpection(Exception):
    pass


@dataclass(frozen=True)
class ChatResult:
    conversation_id: UUID
    reply: str


class ChatService:
    conversation_repo: ConversationRepository
    message_repo: MessageRepository
    llm: GroqLLMService

    def __init__(
        self,
        conversation_repo: ConversationRepository,
        message_repo: MessageRepository,
        llm: GroqLLMService,
    ):

        self.conversation_repo = conversation_repo
        self.message_repo = message_repo
        self.llm = llm

    def chat(self, conversation_id: Optional[UUID], message: str):
        if not conversation_id:  # new conversation
            conversation = self.conversation_repo.create()
        else:  # ongoing conversation
            conversation = self.conversation_repo.get_by_id(conversation_id)
            if not conversation:
                raise ConversationNotFoundExpection(
                    f"Conversation {conversation_id} not found"
                )

        # create the user message in database
        self.message_repo.create(
            conversation_id=conversation.id, role=MessageRole.user, content=message
        )

        # history of messages
        messages = self.message_repo.get_by_conversation_id(conversation_id)
        history = []
        for m in messages:
            match m.role:
                case MessageRole.user:
                    history.append(HumanMessage(content=m.content))
                case MessageRole.assistant:
                    history.append(AIMessage(content=m.content))

        # agent
        agent_response = self.llm.generate_reply(history)

        # create the agent message in database
        self.message_repo.create(
            conversation_id=conversation.id,
            role=MessageRole.assistant,
            content=agent_response.content,
        )

        return ChatResult(conversation_id=conversation.id, reply=agent_response.content)


def get_chat_service(
    conversation_repo: ConversationRepositoryDep,
    message_repo: MessageRepositoryDep,
    llm: GroqLLMServiceDep,
) -> ChatService:
    return ChatService(conversation_repo, message_repo, llm)


ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]
