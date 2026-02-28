from workflow.state import AgentState


def router(state: AgentState):
    if state.get("is_escalated", False):
        return "already_escalated"

    if state.get("requires_escalation", False):
        return "escalate_to_human"

    if state.get("requires_knowledge_search", False) and not state.get(
        "retrieved_context"
    ):
        return "retrieve_knowledge"

    if state.get("requires_order_check", False) and not state.get("order_context"):
        return "fetch_order_data"

    return "generate_reply"
