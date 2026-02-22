from fastapi import APIRouter
from config.db import SessionDep
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from models.all import Conversation, Message, MessageRole
from services.groq import generate_reply
from langchain.messages import HumanMessage, AIMessage

router = APIRouter()

# schemas
class ChatRequest(BaseModel):
    conversation_id: Optional[UUID] = None
    message: str

class ChatResponse(BaseModel):
    conversation_id: UUID
    reply: str

@router.post("/")
def chat(request: ChatRequest, db: SessionDep) -> ChatResponse:
    print(request)
    if request.conversation_id: # ongoing conversation
        conversation = db.query(Conversation)\
            .filter(Conversation.id == request.conversation_id)\
            .first()
    
    else: # new conversation
        conversation = Conversation()
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # save the user message
    user_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.user,
        content=request.message
    )
    db.add(user_message)
    db.commit()

    # history
    messages: list[Message] = db.query(Message)\
        .filter(Message.conversation_id == conversation.id)\
        .order_by(Message.created_at.asc())\
        .all()
    
    history = []
    for m in messages:
        match m.role:
            case MessageRole.user:
                history.append(HumanMessage(content=m.content))
            case MessageRole.assistant:
                history.append(AIMessage(content=m.content))

    history.append(HumanMessage(content=request.message))
    agent_response = generate_reply(history)

    agent_message = Message(
        conversation_id=conversation.id,
        role=MessageRole.assistant,
        content=agent_response.content
    )
    db.add(agent_message)
    db.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        reply=agent_response.content
    )




