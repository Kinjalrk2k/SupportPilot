from langgraph.graph import END
from workflow.state import AgentState


def should_summarize(state: AgentState):
    messages = state["messages"]

    # summarize only if messages are more than 6
    if len(messages) > 6:
        return "summarize_conversation"

    return END
