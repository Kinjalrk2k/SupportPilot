from fastapi import APIRouter, status, Query, HTTPException
from config.db import SessionDep
from models.all import Ticket
from math import ceil
from .schemas import TicketCreate, TicketResponse, TicketUpdate, PaginatedTicketResponse
from uuid import UUID

router = APIRouter()


# CREATE
@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket_data: TicketCreate, db: SessionDep):
    ticket = Ticket(**ticket_data.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


# GET ALL
@router.get("/", response_model=PaginatedTicketResponse)
def get_tickets(
    db: SessionDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    total = db.query(Ticket).count()
    offset = (page - 1) * page_size
    tickets = db.query(Ticket).offset(offset).limit(page_size).all()
    total_pages = ceil(total / page_size) if total else 1

    return {
        "items": tickets,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


# GET ONE
@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: UUID, db: SessionDep):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


# UPDATE
@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: UUID,
    ticket_data: TicketUpdate,
    db: SessionDep,
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    update_data = ticket_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(ticket, key, value)

    db.commit()
    db.refresh(ticket)
    return ticket


# DELETE
@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: UUID, db: SessionDep):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.delete(ticket)
    db.commit()
