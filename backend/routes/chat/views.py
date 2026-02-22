from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from .schemas import ChatRequest, ChatResponse
from services.chat.service import ChatServiceDep
from services.chat.exceptions import ConversationNotFoundExpection

router = APIRouter()


@router.post("/")
def chat(request: ChatRequest, service: ChatServiceDep) -> ChatResponse:

    try:
        response = service.chat(
            conversation_id=request.conversation_id, message=request.message
        )

        return ChatResponse(
            conversation_id=response.conversation_id, reply=response.reply
        )

    except ConversationNotFoundExpection as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/stream")
def stream(request: ChatRequest, service: ChatServiceDep):
    conversation_id, generator = service.stream_chat(
        conversation_id=request.conversation_id, message=request.message
    )

    return StreamingResponse(
        generator,
        media_type="text/plain",
        headers={"X-Conversation-Id": str(conversation_id)},
    )
