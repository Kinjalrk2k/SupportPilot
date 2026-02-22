from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy import ForeignKey, Text
import uuid

from models.base import Base
from models.mixins.timestamp_mixin import TimestampMixin
from models.enums.message_role import MessageRole


class Message(Base, TimestampMixin):
    __tablename__ = "message"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversation.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    role: Mapped[MessageRole] = mapped_column(
        ENUM(MessageRole, name="message_role_enum", create_type=False),
        nullable=False,
    )

    content: Mapped[str] = mapped_column(Text, nullable=False)

    # back populates
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )
