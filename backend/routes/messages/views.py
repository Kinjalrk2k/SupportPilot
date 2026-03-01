from fastapi import APIRouter, status, Query, HTTPException
from config.db import SessionDep
from models.all import Message, Ticket
from math import ceil
from uuid import UUID
from .schemas import MessageResponse

router = APIRouter()


# GET messages
@router.get("/{thread_id}", response_model=list[MessageResponse])
def get_ticket(thread_id: UUID, db: SessionDep):
    ticket = db.query(Ticket).filter(Ticket.id == thread_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    messages = (
        db.query(Message)
        .filter(Message.thread_id == thread_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return messages

