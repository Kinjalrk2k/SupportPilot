from langchain.chat_models import init_chat_model, BaseChatModel
from langchain.agents import create_agent
from langchain_core.runnables import Runnable
from langchain.messages import AnyMessage, AIMessage
from dotenv import load_dotenv
from typing import Annotated, Iterable
from fastapi import Depends
from .base import BaseLLMService
from time import sleep

load_dotenv()


class GroqLLMService(BaseLLMService):
    model: BaseChatModel
    agent: Runnable

    def __init__(self):
        self.model = init_chat_model(
            model="llama-3.1-8b-instant", model_provider="groq"
        )
        self.agent = create_agent(model=self.model)

    def generate_reply(self, messages: list[AnyMessage]) -> AIMessage:
        response = self.agent.invoke({"messages": messages})
        return response["messages"][-1]

    def stream_reply(self, messages: list[AnyMessage]) -> Iterable[str]:
        for token, _ in self.agent.stream({"messages": messages}, stream_mode="messages"):
            if token.content:
                yield token.content


def get_groq_llm_service() -> GroqLLMService:
    return GroqLLMService()


GroqLLMServiceDep = Annotated[GroqLLMService, Depends(get_groq_llm_service)]
