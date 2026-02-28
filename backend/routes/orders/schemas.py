from pydantic import BaseModel, Field
from uuid import UUID
from typing import List, Optional
from models.enums.order import OrderStatus, PaymentStatus
from datetime import datetime


class OrderItemSchema(BaseModel):
    name: str
    qty: int
    amount: float


class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    delivery_address: str
    delivery_notes: Optional[str] = None
    items: List[OrderItemSchema]
    total_amount: float
    order_status: OrderStatus
    payment_status: PaymentStatus


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    delivery_notes: Optional[str] = None
    items: Optional[List[OrderItemSchema]] = None
    total_amount: Optional[float] = None
    order_status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None


class OrderResponse(OrderCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedOrderResponse(BaseModel):
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
