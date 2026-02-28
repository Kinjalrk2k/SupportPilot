from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from models.base import Base
from models.mixins.timestamp_mixin import TimestampMixin
import uuid
from sqlalchemy.dialects.postgresql import UUID, ENUM
from models.enums.ticket import TicketCategory, TicketPriority, TicketStatus


class Ticket(Base, TimestampMixin):
    __tablename__ = "ticket"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("order.id"), nullable=False, index=True
    )

    category: Mapped[TicketCategory] = mapped_column(
        ENUM(TicketCategory, name="ticket_category_enum", create_type=True),
        nullable=True,
    )

    priority: Mapped[TicketPriority] = mapped_column(
        ENUM(TicketPriority, name="ticket_priority_enum", create_type=True),
        nullable=True,
    )

    status: Mapped[TicketStatus] = mapped_column(
        ENUM(TicketStatus, name="ticket_status_enum", create_type=True),
        nullable=False,
    )

    # back populates
    order: Mapped["Order"] = relationship("Order", back_populates="tickets")
