from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import uvicorn
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from schemas import ChatRequest
from workflow.stream import stream_agent_response
from workflow.history import get_agent_history

load_dotenv()
PORT = os.getenv("PORT")

app = FastAPI()


@app.post("/v1/chat/stream")
async def chat_stream(request: ChatRequest):
    latest_user_message = request.messages[-1].content
    return StreamingResponse(
        stream_agent_response(latest_user_message, request.thread_id, request.order_id),
        media_type="text/event-stream",
    )


@app.get("/v1/chat/{thread_id}/history")
async def get_chat_history(thread_id: str):
    return await get_agent_history(thread_id)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(PORT))
