from uuid import UUID
from typing import List, Optional
from pydantic import BaseModel, Field
from models.enums.ticket import TicketCategory, TicketPriority, TicketStatus
from datetime import datetime


class TicketCreate(BaseModel):
    order_id: UUID
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None
    status: TicketStatus


class TicketUpdate(BaseModel):
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None


class TicketResponse(TicketCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedTicketResponse(BaseModel):
    items: List[TicketResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
