from sqlalchemy.orm import Session
from models.all import Ticket, Message
from datetime import datetime, timezone


# ticket_categorization_event
# payload = {
#   'category': 'General',
#   'priority': 'Low',
#   'issue_analyzer_confidence': 0.0,
#   'sentiment': 0.0,
#   'requires_knowledge_search': False,
#   'requires_order_check': True,
#   'requires_escalation': False,
#   'retrieved_context': '',
#   'order_context': '',
#   'order_id': '84bf516d-0768-4961-84f6-c4a25828f44f',
#   'thread_id': '84bf516d-0768-4961-84f6-c4a25828f44f'
# }
def handle_ticket_categorization_events(payload: dict, db: Session):
    print("[ticket_categorization_events]", payload)

    ticket = db.query(Ticket).filter(Ticket.id == payload["thread_id"]).first()

    ticket.category = payload["category"].lower()
    ticket.priority = payload["priority"].lower()
    ticket.status = (
        "escalated_to_human" if payload["requires_escalation"] else "ai_handling"
    )

    db.commit()


# chat_messages_events
# payload = {
#   'thread_id': 'session-user-04',
#   'role': 'user' | 'assistant',
#   'content': 'hello',
#   'sent_at': '2026-02-28T22:46:43.790313+00:00'
# }
def handle_chat_messages_events(payload: dict, db: Session):
    print("[chat_messages_events]", payload)

    try:
        sent_at = datetime.fromisoformat(payload["sent_at"].replace("Z", "+00:00"))
    except Exception:
        sent_at = datetime.now(timezone.utc)

    message = Message(
        thread_id=payload["thread_id"],
        role=payload["role"],
        content=payload["content"],
        sent_at=sent_at,
    )

    db.add(message)
    db.commit()
