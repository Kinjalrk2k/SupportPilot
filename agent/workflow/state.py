from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from typing import TypedDict, Annotated


class AgentState(TypedDict):
    # for conversation
    messages: Annotated[list[BaseMessage], add_messages]

    # conversational summary
    summary: str

    # data extration
    category: str
    priority: str
    issue_analyzer_confidence: float
    sentiment: float

    # router flags
    requires_knowledge_search: bool
    requires_order_check: bool
    requires_escalation: bool

    # additional context
    retrieved_context: str
    order_context: str

    # pre-injected
    order_id: str

    # lockout on escalation
    is_escalated: bool
