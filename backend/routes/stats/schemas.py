from pydantic import BaseModel
from typing import Dict


class TicketStatsResponse(BaseModel):
    total_tickets: int
    status_counts: Dict[str, int]
    category_counts: Dict[str, int]
    priority_counts: Dict[str, int]


class OrderStatsResponse(BaseModel):
    total_orders: int
    total_revenue: float
    order_status_counts: Dict[str, int]
    payment_status_counts: Dict[str, int]
