from langchain_core.messages import HumanMessage, RemoveMessage
from workflow.state import AgentState
from langchain_core.prompts import PromptTemplate
from workflow.dtos import IssueExtractionResult, issue_extraction_parser
from workflow.utils import generate_transcript, extract_message_content, get_sentiment
from workflow.llm import llm
from workflow.vector_db import vector_db

QUERY_REWRITE_PROMPT = """
Given the following conversation history, rewrite the user's latest message into a standalone, highly specific search query for a database. 
If the user uses pronouns like "it" or "that", replace them with the actual subject from the history.
    
HISTORY:
{transcript}
"""


def retrieve_knowledge(state: AgentState):
    # rewrite query for searching
    prompt = PromptTemplate(
        template=QUERY_REWRITE_PROMPT, input_variables=["transcript"]
    )

    messages = state["messages"]
    recent_messages = messages[-4:]  # last four messages
    transcript = generate_transcript(recent_messages)

    rewrite_chain = prompt | llm
    response = rewrite_chain.invoke({"transcript": transcript})
    new_query = extract_message_content(response)

    results = vector_db.similarity_search(new_query, k=3)
    retrieved_context = "No relevant policies found in the database."
    if results:
        retrieved_context = ""
        for i, doc in enumerate(results):
            retrieved_context += f"--- Document Chunk {i+1} ---\n"
            retrieved_context += f"{doc.page_content}\n\n"

    return {"retrieved_context": retrieved_context}
