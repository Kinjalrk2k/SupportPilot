from workflow.state import AgentState
from langchain_core.prompts import PromptTemplate
from workflow.dtos import IssueExtractionResult, issue_extraction_parser
from workflow.utils import generate_transcript, extract_message_content
from workflow.llm import llm

ANALYZE_PROMPT = """
You are a strict data extraction algorithm."
Analyze the messages and extract the exact fields requested.
Focus on the LAST MESSAGE to understand about requires_knowledge_search and requires_order_check flags.
      
{format_instructions}

PAST CONTEXT SUMMARY:
{summary}

RECENT TRANSCRIPT:
{transcript}

LAST MESSAGE:
{latest_message}
"""


def analyze_issue(state: AgentState):
    prompt = PromptTemplate(
        template=ANALYZE_PROMPT,
        input_variables=["summary", "transcript", "latest_message"],
        partial_variables={
            "format_instructions": issue_extraction_parser.get_format_instructions()
        },
    )

    analyzer_chain = prompt | llm | issue_extraction_parser

    try:
        summary = state.get("summary", "No prior context.")
        transcript = generate_transcript(state["messages"])
        latest_message = extract_message_content(state["messages"][-1])
        result = analyzer_chain.invoke(
            {
                "summary": summary,
                "transcript": transcript,
                "latest_message": latest_message,
            }
        )
        print(f"[analyze_issue] {result}")
        print(f"[analyze_issue] {type(result)}")
    except Exception as e:
        print(f"[analyze_issue] [ERROR] {e}")
        result = IssueExtractionResult()

    return {
        "category": result.category,
        "priority": result.priority,
        "issue_analyzer_confidence": result.confidence,
        "sentiment": result.sentiment_score,
        "requires_knowledge_search": result.requires_knowledge_search,
        "requires_order_check": result.requires_order_check,
        "requires_escalation": result.requires_escalation,
        # empty the contexts
        "retrieved_context": "",
        "order_context": "",
    }
