from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from models.order import Order
from .schemas import OrderCreate, OrderUpdate, OrderResponse, PaginatedOrderResponse
from config.db import SessionDep
from math import ceil

router = APIRouter()


# CREATE
@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: SessionDep):
    order = Order(**order_data.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


# GET ALL
@router.get("/", response_model=PaginatedOrderResponse)
def get_orders(
    db: SessionDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    total = db.query(Order).count()
    offset = (page - 1) * page_size
    orders = db.query(Order).offset(offset).limit(page_size).all()
    total_pages = ceil(total / page_size) if total else 1

    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


# GET ONE
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: UUID, db: SessionDep):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# UPDATE
@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: UUID,
    order_data: OrderUpdate,
    db: SessionDep,
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = order_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(order, key, value)

    db.commit()
    db.refresh(order)
    return order


# DELETE
@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: UUID, db: SessionDep):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
