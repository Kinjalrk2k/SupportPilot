from abc import ABC, abstractmethod
from langchain.messages import AIMessage, AnyMessage
from typing import List, Iterable


class BaseLLMService(ABC):
    @abstractmethod
    def generate_reply(self, messages: List[AnyMessage]) -> AIMessage:
        pass

    @abstractmethod
    def stream_reply(self, messages: list[AnyMessage]) -> Iterable[str]:
        pass
