from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from datetime import datetime, timezone
import json
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./chat.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    avatar = Column(String)
    status = Column(String)  # online/offline
    last_seen = Column(DateTime)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    read = Column(Boolean, default=False)

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        await self.update_user_status(user_id, "online")

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        self.update_user_status(user_id, "offline")

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

    async def update_user_status(self, user_id: int, status: str):
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.status = status
            user.last_seen = datetime.now(timezone.utc)
            db.commit()
        db.close()

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            message = await websocket.receive_json()
            db = SessionLocal()
            
            new_message = Message(
                sender_id=user_id,
                receiver_id=message["receiver_id"],
                content=message["content"]
            )
            db.add(new_message)
            db.commit()
            
            await manager.send_personal_message({
                "sender_id": user_id,
                "content": message["content"],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }, message["receiver_id"])
            
            db.close()
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# Pydantic models
class UserBase(BaseModel):
    name: str
    email: str
    avatar: str

class MessageBase(BaseModel):
    content: str
    receiver_id: int

# API endpoints
@app.get("/api/users")
async def get_users():
    db = SessionLocal()
    users = db.query(User).all()
    db.close()
    return users

@app.get("/api/users/{user_id}/messages")
async def get_messages(user_id: int, other_user_id: Optional[int] = None):
    db = SessionLocal()
    query = db.query(Message).filter(
        ((Message.sender_id == user_id) & (Message.receiver_id == other_user_id)) |
        ((Message.sender_id == other_user_id) & (Message.receiver_id == user_id))
    )
    messages = query.order_by(Message.timestamp).all()
    db.close()
    return messages

@app.post("/api/messages/mark-read")
async def mark_messages_read(user_id: int, sender_id: int):
    db = SessionLocal()
    db.query(Message).filter(
        Message.sender_id == sender_id,
        Message.receiver_id == user_id,
        Message.read == False
    ).update({"read": True})
    db.commit()
    db.close()
    return {"status": "success"}