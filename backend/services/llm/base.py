from abc import ABC, abstractmethod
from langchain.messages import AIMessage, AnyMessage
from typing import List


class BaseLLMService(ABC):
    @abstractmethod
    def generate_reply(self, messages: List[AnyMessage]) -> AIMessage:
        pass
