from fastapi import APIRouter, HTTPException, status
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
