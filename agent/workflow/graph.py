from phoenix.otel import register
from openinference.instrumentation.langchain import LangChainInstrumentor
from langgraph.graph import StateGraph, START, END
from workflow.state import AgentState
from workflow.nodes import (
    already_escalated,
    analyze_issue,
    escalate_to_human,
    fetch_order_data,
    generate_reply,
    retrieve_knowledge,
    summarize_conversation,
)
from workflow.edges import router, should_summarize
from workflow.utils import str_to_bool
from dotenv import load_dotenv
import os

load_dotenv()


workflow = StateGraph(AgentState)

workflow.add_node("analyze_issue", analyze_issue)
workflow.add_node("generate_reply", generate_reply)
workflow.add_node("summarize_conversation", summarize_conversation)
workflow.add_node("retrieve_knowledge", retrieve_knowledge)
workflow.add_node("fetch_order_data", fetch_order_data)
workflow.add_node("escalate_to_human", escalate_to_human)
workflow.add_node("already_escalated", already_escalated)

workflow.add_edge(START, "analyze_issue")

# main router
workflow.add_conditional_edges(
    "analyze_issue",
    router,
    {
        "already_escalated": "already_escalated",
        "escalate_to_human": "escalate_to_human",
        "retrieve_knowledge": "retrieve_knowledge",
        "fetch_order_data": "fetch_order_data",
        "generate_reply": "generate_reply",
    },
)

# workers
workflow.add_edge("escalate_to_human", END)
workflow.add_edge("already_escalated", END)

workflow.add_conditional_edges(
    "retrieve_knowledge",
    router,
    {
        "fetch_order_data": "fetch_order_data",
        "generate_reply": "generate_reply",
    },
)

workflow.add_conditional_edges(
    "fetch_order_data",
    router,
    {
        "retrieve_knowledge": "retrieve_knowledge",
        "generate_reply": "generate_reply",
    },
)

workflow.add_conditional_edges(
    "generate_reply",
    should_summarize,
    {
        "summarize_conversation": "summarize_conversation",
        END: END,
    },
)

workflow.add_edge("summarize_conversation", END)

graph = workflow.compile()
