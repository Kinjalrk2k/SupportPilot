from langchain_core.messages import HumanMessage, RemoveMessage
from workflow.state import AgentState
from langchain_core.prompts import PromptTemplate
from workflow.models import IssueExtractionResult, issue_extraction_parser
from workflow.utils import generate_transcript, extract_message_content, get_sentiment
from workflow.llm import llm

SUMMARIZE_PROMPT = """
Update the following conversation summary based on the new messages.

CURRENT SUMMARY: {summary}

NEW MESSAGES TO SUMMARIZE:
{transcript}
"""


def summarize_conversation(state: AgentState):
    prompt = PromptTemplate(
        template=SUMMARIZE_PROMPT, input_variables=["summary", "transcript"]
    )

    # summarize everything except the last two
    summary = state.get("summary", "")
    messages = state["messages"]
    messages_to_summarize = messages[:-2]
    transcript = generate_transcript(messages_to_summarize)

    summarizer_chain = prompt | llm
    new_summary = summarizer_chain.invoke(
        {"summary": summary, "transcript": transcript}
    )

    deleted_messages = [RemoveMessage(id=msg.id) for msg in messages_to_summarize]

    return {
        "summary": new_summary.content,
        "messages": deleted_messages,
    }
