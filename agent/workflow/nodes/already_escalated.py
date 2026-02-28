from langchain_core.messages import AIMessage
from workflow.state import AgentState


def already_escalated(state: AgentState):
    reply = "Your ticket is currently assigned to a human agent. They will reply to you here as soon as they are available."
    return {"messages": [AIMessage(content=reply)]}
