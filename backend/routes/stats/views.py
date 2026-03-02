from fastapi import APIRouter, status, Query, HTTPException
from config.db import SessionDep
from models.all import Ticket
from math import ceil
from uuid import UUID
from sqlalchemy import select, func
from models.all import (
    Order,
    OrderStatus,
    PaymentStatus,
    Ticket,
    TicketCategory,
    TicketPriority,
    TicketStatus,
)
from .schemas import TicketStatsResponse, OrderStatsResponse

router = APIRouter()


@router.get("/orders", response_model=OrderStatsResponse)
def order_stats(db: SessionDep):
    # grouped by order status
    order_status_stmt = select(Order.order_status, func.count(Order.id)).group_by(
        Order.order_status
    )
    order_status_rows = db.execute(order_status_stmt).all()

    # ensure all statuses appear even if 0
    order_status_counts = {status.value: 0 for status in OrderStatus}
    for status, count in order_status_rows:
        order_status_counts[status.value] = count

    # grouped by payment status
    payment_status_stmt = select(Order.payment_status, func.count(Order.id)).group_by(
        Order.payment_status
    )
    payment_status_rows = db.execute(payment_status_stmt).all()

    # ensure all statuses appear even if 0
    payment_status_counts = {status.value: 0 for status in PaymentStatus}
    for status, count in payment_status_rows:
        payment_status_counts[status.value] = count

    # total orders
    total_orders = db.execute(select(func.count(Order.id))).scalar() or 0

    # total revenue
    total_revenue = (
        db.execute(select(func.coalesce(func.sum(Order.total_amount), 0))).scalar() or 0
    )

    return {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "order_status_counts": order_status_counts,
        "payment_status_counts": payment_status_counts,
    }


@router.get("/tickets", response_model=TicketStatsResponse)
def order_stats(db: SessionDep):
    # grouped by status
    status_stmt = select(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status)

    status_rows = db.execute(status_stmt).all()
    status_counts = {status.value: 0 for status in TicketStatus}

    for status, count in status_rows:
        status_counts[status.value] = count

    # grouped by category
    category_stmt = select(Ticket.category, func.count(Ticket.id)).group_by(
        Ticket.category
    )

    category_rows = db.execute(category_stmt).all()
    category_counts = {cat.value: 0 for cat in TicketCategory}

    for category, count in category_rows:
        if category is not None:  # nullable field
            category_counts[category.value] = count

    # grouped by priority
    priority_stmt = select(Ticket.priority, func.count(Ticket.id)).group_by(
        Ticket.priority
    )

    priority_rows = db.execute(priority_stmt).all()
    priority_counts = {prio.value: 0 for prio in TicketPriority}

    for priority, count in priority_rows:
        if priority is not None:  # nullable field
            priority_counts[priority.value] = count

    # total
    total_tickets = db.execute(select(func.count(Ticket.id))).scalar() or 0

    return {
        "total_tickets": total_tickets,
        "status_counts": status_counts,
        "category_counts": category_counts,
        "priority_counts": priority_counts,
    }
