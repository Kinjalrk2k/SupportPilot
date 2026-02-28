from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage
from workflow.state import AgentState
from langchain_core.prompts import PromptTemplate
from workflow.dtos import IssueExtractionResult, issue_extraction_parser
from workflow.utils import generate_transcript, extract_message_content, get_sentiment
from workflow.llm import llm

REPLY_SYSTEM_PROMPT = """
You are a world-class, empathetic customer support agent.

PAST CONTEXT SUMMARY:
{summary}

CURRENT TICKET CONTEXT:
- Issue Category: {category}
- Priority Level: {priority}
- User's Current Emotion: {sentiment}

{system_data_block}

YOUR INSTRUCTIONS:
{dynamic_instructions}
- Adjust your tone perfectly to match their '{sentiment}' emotion. 
  (If they are 'Angry' or 'Frustrated', be deeply apologetic and concise. If they are 'Neutral' or 'Happy', be warm and conversational).
- IMPORTANT: Do NOT explicitly mention the category, priority or emotion. Just naturally embody the correct tone.
"""


def generate_reply(state: AgentState):
    default_result = IssueExtractionResult()
    category = state.get("category", default_result.category)
    priority = state.get("priority", default_result.priority)
    sentiment_score = state.get("sentiment_score", default_result.sentiment_score)
    sentiment = get_sentiment(sentiment_score)
    summary = state.get("summary", "No prior context.")

    requires_search = state.get("requires_knowledge_search", False)
    requires_order = state.get("requires_order_check", False)
    context = state.get("retrieved_context", "")
    order_context = state.get("order_context", "")
    system_data_block = ""
    dynamic_instructions = ""

    # for RAG
    if requires_search and context:
        system_data_block += f"COMPANY KNOWLEDGE BASE:\n{context}\n\n"
        dynamic_instructions += "- Answer the user's factual questions using ONLY the provided Company Knowledge Base. Do NOT guess.\n"

    # for Order Data
    if requires_order and order_context:
        system_data_block += f"LIVE ORDER DATA:\n{order_context}\n\n"
        dynamic_instructions += "- Use the LIVE ORDER DATA to inform the user about their specific order status.\n"
        dynamic_instructions += "- IMPORTANT: You already securely authenticated the user. The LIVE ORDER DATA belongs to them. Do NOT ask for their name, email, or order number. Answer them immediately.\n"

    # Fallback
    if not requires_search and not requires_order:
        dynamic_instructions += "- Acknowledge their issue directly and provide helpful, conversational support.\n"

    prompt = ChatPromptTemplate.from_messages(
        [("system", REPLY_SYSTEM_PROMPT), MessagesPlaceholder(variable_name="messages")]
    )

    reply_chain = prompt | llm

    response = reply_chain.invoke(
        {
            "summary": summary,
            "category": category,
            "priority": priority,
            "sentiment": sentiment,
            "system_data_block": system_data_block.strip(),
            "dynamic_instructions": dynamic_instructions.strip(),
            "messages": state["messages"],
        }
    )

    return {"messages": [response]}
