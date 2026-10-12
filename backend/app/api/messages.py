import os
import json
import uuid
import datetime
import shutil
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/messages", tags=["Real-Life Staff Legal Chat"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MESSAGES_FILE = os.path.join(DATA_DIR, "messages.json")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)

def load_messages() -> list:
    if os.path.exists(MESSAGES_FILE):
        try:
            with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_messages(records: list):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

class SendMessageModel(BaseModel):
    senderId: str
    senderName: str
    recipientId: str
    recipientName: str
    text: str
    channel: Optional[str] = "internal"
    attachmentUrl: Optional[str] = None
    attachmentName: Optional[str] = None
    attachmentType: Optional[str] = None
    matterRef: Optional[str] = None

@router.get("")
async def get_messages(user1: Optional[str] = None, user2: Optional[str] = None):
    """
    Returns messages between two users or all messages if no users specified.
    """
    all_msgs = load_messages()
    if user1 and user2:
        u1 = user1.strip().lower()
        u2 = user2.strip().lower()
        filtered = [
            m for m in all_msgs
            if (m.get("senderId", "").lower() == u1 and m.get("recipientId", "").lower() == u2)
            or (m.get("senderId", "").lower() == u2 and m.get("recipientId", "").lower() == u1)
            or (m.get("senderName", "").lower() == u1 and m.get("recipientName", "").lower() == u2)
            or (m.get("senderName", "").lower() == u2 and m.get("recipientName", "").lower() == u1)
        ]
        return {"messages": filtered}
    return {"messages": all_msgs}

@router.post("")
async def send_message(payload: SendMessageModel):
    """
    Saves a new staff-to-staff message with optional document or matter reference.
    """
    if not payload.text.strip() and not payload.attachmentUrl:
        raise HTTPException(status_code=400, detail="Cannot send an empty message.")

    all_msgs = load_messages()
    new_msg = {
        "id": f"msg-{uuid.uuid4().hex[:10]}",
        "senderId": payload.senderId,
        "senderName": payload.senderName,
        "recipientId": payload.recipientId,
        "recipientName": payload.recipientName,
        "text": payload.text.strip(),
        "channel": payload.channel or "internal",
        "attachmentUrl": payload.attachmentUrl,
        "attachmentName": payload.attachmentName,
        "attachmentType": payload.attachmentType,
        "matterRef": payload.matterRef,
        "createdAt": datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
    }

    all_msgs.append(new_msg)
    save_messages(all_msgs)

    return {"success": True, "message": new_msg}

@router.delete("/{message_id}")
async def delete_message(message_id: str):
    """
    Permanently deletes a message from the conversation thread.
    """
    all_msgs = load_messages()
    initial_len = len(all_msgs)
    all_msgs = [m for m in all_msgs if m.get("id") != message_id]
    if len(all_msgs) == initial_len:
        raise HTTPException(status_code=404, detail="Message not found.")
    save_messages(all_msgs)
    return {"success": True, "deletedId": message_id}

@router.post("/upload")
async def upload_chat_file(file: UploadFile = File(...)):
    """
    Stores an uploaded chat attachment (PDF, court ruling, affidavit, image)
    and returns its accessible download URL.
    """
    ext = os.path.splitext(file.filename)[1]
    safe_name = f"{uuid.uuid4().hex[:8]}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOADS_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "success": True,
        "url": f"/api/v1/messages/files/{safe_name}",
        "fileName": file.filename,
        "fileSize": os.path.getsize(file_path),
        "fileType": ext.lstrip(".").lower()
    }

@router.get("/files/{filename}")
async def get_chat_file(filename: str):
    """Serves uploaded chat documents."""
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(file_path)
