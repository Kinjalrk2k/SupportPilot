from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, DateTime
from models.base import Base
from models.mixins.timestamp_mixin import TimestampMixin
import uuid
from sqlalchemy.dialects.postgresql import UUID, ENUM
from models.enums.message import MessageRole


class Message(Base, TimestampMixin):
    __tablename__ = "message"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # NOTE: thread_id is actually the ticket_id only, as one ticket would have one conversation thread
    thread_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ticket.id"), nullable=False, index=True
    )

    role: Mapped[MessageRole] = mapped_column(
        ENUM(MessageRole, name="msg_role_enum", create_type=True),
        nullable=False,
    )

    content: Mapped[str] = mapped_column(String(), nullable=False)

    sent_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)

    # back populates
    thread: Mapped["Ticket"] = relationship("Ticket", back_populates="messages")
