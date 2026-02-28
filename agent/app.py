from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import uvicorn
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from langgraph.checkpoint.redis.aio import AsyncRedisSaver
from workflow.graph import workflow
import time
from langchain_core.messages import HumanMessage
import json

load_dotenv()
PORT = os.getenv("PORT")
REDIS_URI = os.getenv("REDIS_URI")

app = FastAPI()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    thread_id: str  # Crucial: Tells Redis which user's memory to load
    order_id: str
    messages: list[ChatMessage]

async def stream_agent_response(user_input: str, thread_id: str, order_id: str):
    async with AsyncRedisSaver.from_conn_string(REDIS_URI) as checkpointer:
        await checkpointer.setup() # first time setting up

        agent = workflow.compile(checkpointer=checkpointer)

        config = {"configurable": {"thread_id": thread_id}}
        chunk_id = f"chatcmpl-{int(time.time())}"

        # redis passes the other messages
        payload = {
            "messages": [HumanMessage(content=user_input)],
            "order_id": order_id
        }

        async for event in agent.astream_events(payload, config=config, version="v2"):
            kind = event["event"]
            
            if kind == "on_chat_model_stream" and event["metadata"].get("langgraph_node") == "generate_reply":
                token = event["data"]["chunk"].content
                if token:
                    chunk = {
                        "id": chunk_id,
                        "object": "chat.completion.chunk",
                        "choices": [{"delta": {"content": token}}]
                    }
                    yield f"data: {json.dumps(chunk)}\n\n"
            
            # need to seperatly catch them as it doesn't go through the generate_reply
            elif kind == "on_chain_end" and event["name"] in ["escalate_to_human", "already_escalated"]:
                node_output = event["data"].get("output", {})
                if "messages" in node_output and node_output["messages"]:
                    content = node_output["messages"][-1].content
                    chunk = {
                        "id": chunk_id,
                        "object": "chat.completion.chunk",
                        "choices": [{"delta": {"content": content}}]
                    }
                    yield f"data: {json.dumps(chunk)}\n\n"
            
        # complete SSE
        yield "data: [DONE]\n\n"


@app.post("/v1/chat/stream")
async def chat_stream(request: ChatRequest):
    latest_user_message = request.messages[-1].content
    return StreamingResponse(
        stream_agent_response(latest_user_message, request.thread_id, request.order_id),
        media_type="text/event-stream"
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(PORT))