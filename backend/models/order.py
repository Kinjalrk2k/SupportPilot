from models.base import Base
from models.mixins.timestamp_mixin import TimestampMixin

from sqlalchemy import String, Float, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ENUM
import uuid
from models.enums.order_status import OrderStatus
from models.enums.payment_status import PaymentStatus
from typing import TypedDict


class OrderItem(TypedDict):
    name: str
    qty: int
    amount: float


class Order(Base, TimestampMixin):
    __tablename__ = "order"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    customer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(20), nullable=False)

    delivery_address: Mapped[str] = mapped_column(String(255), nullable=False)
    delivery_notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

    items: Mapped[list[OrderItem]] = mapped_column(JSON, nullable=False)

    total_amount: Mapped[float] = mapped_column(Float, nullable=False)

    order_status: Mapped[OrderStatus] = mapped_column(
        ENUM(OrderStatus, name="message_role_enum", create_type=False),
        nullable=False,
    )

    payment_status: Mapped[PaymentStatus] = mapped_column(
        ENUM(PaymentStatus, name="message_role_enum", create_type=False),
        nullable=False,
    )
