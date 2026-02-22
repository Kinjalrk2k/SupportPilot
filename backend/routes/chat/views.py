from fastapi import APIRouter, HTTPException, status
from .schemas import ChatRequest, ChatResponse
from dependencies.service import get_chat_service
from services.chat_service import ChatService, ConversationNotFoundExpection
from fastapi import Depends

router = APIRouter()

@router.post("/")
def chat(
    request: ChatRequest, 
    service: ChatService = Depends(get_chat_service)
) -> ChatResponse:
    
    try:
        response = service.chat(
            conversation_id=request.conversation_id, 
            message=request.message
        )

        return ChatResponse(
            conversation_id=response["conversation_id"], 
            reply=response["reply"]
        )
    
    except ConversationNotFoundExpection as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    
