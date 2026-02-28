from langchain_core.messages import AIMessage
from workflow.state import AgentState


def escalate_to_human(state: AgentState):
    handoff_message = (
        "I understand, and I want to make sure this gets resolved perfectly for you. "
        "I am escalating this chat to a human support specialist right now. "
        "They will review our conversation and be with you shortly."
    )

    return {"messages": [AIMessage(content=handoff_message)], "is_escalated": True}
