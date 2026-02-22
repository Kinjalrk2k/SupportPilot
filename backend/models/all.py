from models.base import Base

from models.enums.message_role import MessageRole

from models.mixins.timestamp_mixin import TimestampMixin

from models.conversation import Conversation
from models.message import Message

from models.functions.updated_at import trigger_set_updated_at

functions = [trigger_set_updated_at]
