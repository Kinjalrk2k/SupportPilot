import enum


class TicketCategory(enum.Enum):
    billing = "billing"
    technical = "technical"
    login = "login"
    general = "general"


class TicketPriority(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class TicketStatus(enum.Enum):
    ai_handling = "ai_handling"
    escalated_to_human = "escalated_to_human"
    human_handling = "human_handling"
    closed = "closed"
