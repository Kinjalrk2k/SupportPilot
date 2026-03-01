from fastapi import (
    APIRouter,
    status,
    Query,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from config.db import SessionDep
from models.all import Message, Ticket, MessageRole
from math import ceil
from uuid import UUID
from .schemas import MessageResponse
import traceback
from datetime import datetime, timezone

router = APIRouter()


# TODO: move this to redis
class MessagesConnectionManager:
    active_connections = dict[UUID, list[WebSocket]]

    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, thread_id: UUID):
        await websocket.accept()
        if thread_id not in self.active_connections:
            self.active_connections[thread_id] = []
        self.active_connections[thread_id].append(websocket)

    def disconnect(self, websocket: WebSocket, thread_id: UUID):
        if thread_id in self.active_connections:
            self.active_connections[thread_id].remove(websocket)
            if not self.active_connections[thread_id]:
                del self.active_connections[thread_id]

    async def broadcast_to_thread(self, payload: str, thread_id: UUID):
        if thread_id in self.active_connections:
            for connection in self.active_connections[thread_id]:
                await connection.send_json(payload)


manager = MessagesConnectionManager()


@router.websocket("/ws/{thread_id}/{role}")
async def chat_endpoint(
    websocket: WebSocket, thread_id: UUID, role: MessageRole, db: SessionDep
):
    ticket = db.query(Ticket).filter(Ticket.id == thread_id).first()
    if not ticket:
        await websocket.close(code=1008, reason="Invalid topic")
        return

    await manager.connect(websocket, thread_id)
    await manager.broadcast_to_thread(
        {
            "type": "system",
            "role": None,
            "content": f"{role.value} joined the thread",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        thread_id,
    )

    try:
        while True:
            data = await websocket.receive_text()

            message = Message(
                thread_id=thread_id,
                role=role.value,
                content=data,
            )
            db.add(message)
            db.commit()

            await manager.broadcast_to_thread(
                {
                    "type": "chat",
                    "role": role.value,
                    "content": data,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
                thread_id,
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, thread_id)
        await manager.broadcast_to_thread(
            {
                "type": "system",
                "role": None,
                "content": f"{role.value} left the thread",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            thread_id,
        )
    except Exception as e:
        traceback.print_exc()
        manager.disconnect(websocket, thread_id)
        await manager.broadcast_to_thread(
            {
                "type": "system",
                "role": None,
                "content": f"{role.value} left the thread",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            thread_id,
        )


# GET messages
@router.get("/{thread_id}", response_model=list[MessageResponse])
def get_ticket(thread_id: UUID, db: SessionDep):
    ticket = db.query(Ticket).filter(Ticket.id == thread_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    messages = (
        db.query(Message)
        .filter(Message.thread_id == thread_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return messages
