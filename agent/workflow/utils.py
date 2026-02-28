from langchain_core.messages import HumanMessage, BaseMessage
from typing import Literal


def extract_message_content(message: BaseMessage):
    content = message.content

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        return " ".join(
            part.get("text", "") for part in content if isinstance(part, dict)
        )

    return str(content)


def generate_transcript(messages: list[BaseMessage]) -> str:
    transcript = ""
    for msg in messages:
        role = "User" if isinstance(msg, HumanMessage) else "Bot"
        content = extract_message_content(msg)
        transcript += f"{role}: {content}\n"
    return transcript


def get_sentiment(
    sentiment_score: float,
) -> Literal["Angry", "Frustrated", "Neutral", "Satisfied", "Happy"]:
    score = max(-1.0, min(1.0, sentiment_score))

    if score <= -0.6:
        return "Angry"
    elif score <= -0.2:
        return "Frustrated"
    elif score < 0.2:
        return "Neutral"
    elif score < 0.6:
        return "Satisfied"
    else:
        return "Happy"


def str_to_bool(value: str) -> bool:
    return value.lower() in ("true", "1", "yes", "on")
