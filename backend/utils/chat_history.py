from models.all import Message, MessageRole
from langchain.messages import AnyMessage, AIMessage, HumanMessage
from pprint import pprint


def db_messages_to_history(messages: list[Message]) -> list[AnyMessage]:
    history = []
    for m in messages:
        match m.role:
            case MessageRole.user:
                history.append(HumanMessage(content=m.content))
            case MessageRole.assistant:
                history.append(AIMessage(content=m.content))

    return history


def print_history(history: list[AnyMessage]):
    for h in history:
        print("- ", end="")
        pprint(h)
