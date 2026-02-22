from langchain.chat_models import init_chat_model, BaseChatModel
from langchain.agents import create_agent
from langchain_core.runnables import Runnable
from langchain.messages import AnyMessage, AIMessage
from dotenv import load_dotenv
from typing import Annotated, Iterable
from fastapi import Depends
from .base import BaseLLMService
from time import sleep
import os
from langchain_openai import ChatOpenAI


load_dotenv()


class LocalLLMService(BaseLLMService):
    model: BaseChatModel
    agent: Runnable

    def __init__(self):
        self.model = ChatOpenAI(
            base_url=os.getenv("LOCAL_OPENAI_URL"),
            api_key="not-needed"
        )
        self.agent = create_agent(model=self.model)

    def generate_reply(self, messages: list[AnyMessage]) -> AIMessage:
        response = self.agent.invoke({"messages": messages})
        return response["messages"][-1]

    def stream_reply(self, messages: list[AnyMessage]) -> Iterable[str]:
        for token, _ in self.agent.stream({"messages": messages}, stream_mode="messages"):
            if token.content:
                yield token.content


def get_local_llm_service() -> LocalLLMService:
    return LocalLLMService()


LocalLLMServiceDep = Annotated[LocalLLMService, Depends(get_local_llm_service)]
