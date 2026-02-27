# %%
from dotenv import load_dotenv
load_dotenv()

# %%
from phoenix.otel import register
from openinference.instrumentation.langchain import LangChainInstrumentor

# Initialize Phoenix Tracer (Defaults to sending traces to http://localhost:6006)
tracer_provider = register(
    project_name="support_pilot_agent"
)
# Auto-instrument all LangChain and LangGraph calls
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)

# %%
from langchain.chat_models import init_chat_model
llm = init_chat_model(model="llama-3.1-8b-instant", model_provider="groq")
# llm = init_chat_model(model="gemma-3-27b-it", model_provider="google_genai")

# %%
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

# %%
from pydantic import BaseModel, Field, model_validator
from langchain_core.output_parsers import PydanticOutputParser
from typing import Literal

class IssueExtractionResult(BaseModel):
    category: str = Field(
        description="Categorize the issue: Billing, Technical, Login, or General.",
        default="General"
    )
    priority: Literal["Low", "Medium", "High", "Urgent"] = Field(
        description="Assess priority: Low, Medium, High, or Urgent.",
        default="Low"
    )
    confidence: float = Field(
        description="A score from 0.0 to 1.0 indicating how confident you are in this classification. A vague message should have a low score.", 
        ge=0.0, 
        le=1.0,
        default=0.0
    )
    sentiment_score: float = Field(
        description="A score from -1.0 (extremely negative/angry) to 1.0 (extremely positive/happy). 0.0 is neutral.",
        default=0.0
    )

    requires_knowledge_search: bool = Field(
        default=False, 
        description="Set to True ONLY if the user is asking a factual question about policies, pricing, or features that requires looking up documentation. Set to False for greetings, complaints, or simple conversational replies."
    )
    
    requires_order_check: bool = Field(
        default=False, 
        description="Set to True ONLY if the user is asking about the status, location, delivery date, or details of their specific order or package. Set to False for general policy questions, greetings, or complaints."
    )

    requires_escalation: bool = Field(
        default=False,
        description="Set to True ONLY if the user explicitly asks to speak to a human, live agent, or manager, OR if their input is extremely abusive and furious."
    )

    # The Dynamic Validator
    @model_validator(mode='before')
    @classmethod
    def drop_empty_strings(cls, data: any) -> any:
        """
        Scans the incoming JSON dictionary. If any string is empty or just spaces,
        it removes the key entirely, forcing Pydantic to use the field's default value.
        """
        # Ensure the incoming data is actually a dictionary
        if isinstance(data, dict):
            cleaned_data = {}
            for key, value in data.items():
                # If it's a string and it's empty/blank, we skip adding it to our clean dict
                if isinstance(value, str) and not value.strip():
                    continue 
                # Otherwise, keep the data
                cleaned_data[key] = value
            return cleaned_data
        return data

issue_extraction_parser = PydanticOutputParser(pydantic_object=IssueExtractionResult)
print(issue_extraction_parser.get_format_instructions())

# %%
# as new versions have the text in parts: [{'type': 'text', 'text': '...'}]
def extract_message_content(message: BaseMessage):
    content = message.content
    
    if isinstance(content, str):
        return content
    
    if isinstance(content, list):
        return " ".join(part.get("text", "") for part in content if isinstance(part, dict))
    
    return str(content)

# %%
from langchain_core.messages import HumanMessage

def generate_transcript(messages: list[BaseMessage]) -> str:
    transcript = ""
    for msg in messages:
        role = "User" if isinstance(msg, HumanMessage) else "Bot"
        content = extract_message_content(msg)
        transcript += f"{role}: {content}\n"
    return transcript

# %%
from langchain_core.prompts import PromptTemplate

def analyze_issue(state: AgentState):
    prompt = PromptTemplate(
        template="""
            You are a strict data extraction algorithm."
            Analyze the messages and extract the exact fields requested.
                  
            {format_instructions}

            PAST CONTEXT SUMMARY:
            {summary}

            RECENT TRANSCRIPT:
            {transcript}
        """,
        input_variables=["summary", "transcript"],
        partial_variables={"format_instructions": issue_extraction_parser.get_format_instructions()}
    )

    analyzer_chain = prompt | llm | issue_extraction_parser

    try:
        summary = state.get('summary', 'No prior context.')
        transcript = generate_transcript(state["messages"])
        result = analyzer_chain.invoke({"summary": summary, "transcript": transcript})
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
    }


# %%
from typing import Literal

def get_sentiment(sentiment_score: float) -> Literal["Angry", "Frustrated", "Neutral", "Satisfied", "Happy"]:
    score = max(-1.0, min(1.0, sentiment_score))
    
    if score <= -0.6:
        return "Angry"
    elif score <= -0.2:
        return "Frustrated"
    elif score < 0.2:
        return "Neutral"
    elif score < 0.6:
        return "Satisfied"
    else:
        return "Happy"

# %%
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage

REPLY_SYSTEM_PROMPT = """You are a world-class, empathetic customer support agent.

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
    summary = state.get('summary', 'No prior context.')
    
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
   
   
    prompt = ChatPromptTemplate.from_messages([
        ("system", REPLY_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="messages")
    ])
   
    reply_chain = prompt | llm
   
    response = reply_chain.invoke({
       "summary": summary,
       "category": category,
       "priority": priority,
       "sentiment": sentiment,
       "system_data_block": system_data_block.strip(),
       "dynamic_instructions": dynamic_instructions.strip(),
       "messages": state["messages"]
   })
   
    return {"messages": [response]}

# %%
from langchain_core.messages import HumanMessage, RemoveMessage

def summarize_conversation(state: AgentState):
    prompt = PromptTemplate(
        template="""Update the following conversation summary based on the new messages.

        CURRENT SUMMARY: {summary}

        NEW MESSAGES TO SUMMARIZE:
        {transcript}
        """,
        input_variables=["summary", "transcript"]
    )

    # summarize everything except the last two
    summary = state.get("summary", "")
    messages = state["messages"]
    messages_to_summarize = messages[:-2]
    transcript = generate_transcript(messages_to_summarize)
    
    summarizer_chain = prompt | llm
    new_summary = summarizer_chain.invoke({
        "summary": summary,
        "transcript": transcript
    })

    deleted_messages = [RemoveMessage(id=msg.id) for msg in messages_to_summarize]

    return {
        "summary": new_summary.content,
        "messages": deleted_messages,
    }


# %%
from langgraph.graph import END

def route_to_summarize(state: AgentState):
    messages = state["messages"]

    # summarize only if messages are more than 6
    if len(messages) > 6:
        return "summarize_conversation"
    
    return END

# %%
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
vector_db = Chroma(
    persist_directory="./chroma_db/",
    embedding_function=embeddings
)

# %%
def retrieve_knowledge(state: AgentState):
    # rewrite query for searching
    prompt = PromptTemplate(
        template="""Given the following conversation history, rewrite the user's latest message into a standalone, highly specific search query for a database. 
        If the user uses pronouns like "it" or "that", replace them with the actual subject from the history.
    
        HISTORY:
        {transcript}
        """,
        input_variables=["transcript"]
    )


    messages = state["messages"]
    recent_messages = messages[-4:] # last four messages
    transcript = generate_transcript(recent_messages)
    
    rewrite_chain = prompt | llm
    response = rewrite_chain.invoke({
        "transcript": transcript
    })
    new_query = extract_message_content(response)

    results = vector_db.similarity_search(new_query, k=3)
    retrieved_context = "No relevant policies found in the database."
    if results:
        retrieved_context = ""
        for i, doc in enumerate(results):
            retrieved_context += f"--- Document Chunk {i+1} ---\n"
            retrieved_context += f"{doc.page_content}\n\n"

    return {"retrieved_context": retrieved_context}

# %%
def route_to_retrieve_knowledge(state: AgentState):
    if state.get("requires_knowledge_search", False):
        return "retrieve_knowledge"
    return "generate_reply"

# %%
import requests
import json

def fetch_order_data(state: AgentState):
    order_id = state.get("order_id")

    if not order_id:
        return {"order_context": "No relevant order details found"}
    
    response = requests.get(f"http://127.0.0.1:8000/orders/{order_id}")
    data = response.json()
    return {"order_context": json.dumps(data)}

# %%
def route_to_fetch_order_data(state: AgentState):
    if state.get("requires_order_check", False):
        return "fetch_order_data"
    return "buffer_fetch"

# %%
def buffer_fetch(state: AgentState):
    return {}

# %%
from langchain_core.messages import AIMessage

def escalate_to_human(state: AgentState):    
    handoff_message = (
        "I understand, and I want to make sure this gets resolved perfectly for you. "
        "I am escalating this chat to a human support specialist right now. "
        "They will review our conversation and be with you shortly."
    )
    
    return {
        "messages": [AIMessage(content=handoff_message)],
        "is_escalated": True
    }

# %%
def buffer_escalate(state: AgentState):
    return {}

# %%
def route_to_escalate(state: AgentState):
    if state.get("requires_escalation", False):
        return "escalate_to_human"
    return "buffer_escalate"

# %%
def already_escalated(state: AgentState):
    reply = "Your ticket is currently assigned to a human agent. They will reply to you here as soon as they are available."
    return {"messages": [AIMessage(content=reply)]}

# %%
def route_to_already_escalated(state: AgentState):
    if state.get("is_escalated", False):
        return "already_escalated"

    return "analyze_issue"

# %%
from langgraph.graph import StateGraph, START, END

workflow = StateGraph(AgentState)

workflow.add_node("analyze_issue", analyze_issue)
workflow.add_node("generate_reply", generate_reply)
workflow.add_node("summarize_conversation", summarize_conversation)
workflow.add_node("retrieve_knowledge", retrieve_knowledge)
workflow.add_node("fetch_order_data", fetch_order_data)
workflow.add_node("buffer_fetch", buffer_fetch)
workflow.add_node("escalate_to_human", escalate_to_human)
workflow.add_node("buffer_escalate", buffer_escalate)
workflow.add_node("already_escalated", already_escalated)

workflow.add_conditional_edges(
    START, 
    route_to_already_escalated,
    {
        "already_escalated": "already_escalated",
        "analyze_issue": "analyze_issue"
    }
)
workflow.add_conditional_edges(
    "analyze_issue",
    route_to_escalate,
    {
        "escalate_to_human": "escalate_to_human",
        "buffer_escalate": "buffer_escalate"
    }
)
workflow.add_conditional_edges(
    "buffer_escalate",
    route_to_fetch_order_data,
    {
        "fetch_order_data": "fetch_order_data",
        "buffer_fetch": "buffer_fetch"
    }
)
workflow.add_edge("fetch_order_data", "buffer_fetch")
workflow.add_conditional_edges(
    "buffer_fetch",
    route_to_retrieve_knowledge,
    {
        "retrieve_knowledge": "retrieve_knowledge",
        "generate_reply": "generate_reply"
    }
)
workflow.add_edge("retrieve_knowledge", "generate_reply")
workflow.add_conditional_edges(
    "generate_reply", 
    route_to_summarize,
    {
        "summarize_conversation": "summarize_conversation",
        END: END,
    }
)
workflow.add_edge("summarize_conversation", END)
workflow.add_edge("escalate_to_human", END)
workflow.add_edge("already_escalated", END)

graph = workflow.compile()

# %%
from IPython.display import Image, display
display(Image(graph.get_graph().draw_mermaid_png()))

# %%
from langchain_core.messages import HumanMessage
from pprint import pprint

result = graph.invoke({"messages": [HumanMessage(content="Hello")]})
pprint(result)


