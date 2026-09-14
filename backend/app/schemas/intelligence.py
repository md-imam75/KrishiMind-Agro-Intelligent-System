from pydantic import BaseModel, Field
import uuid
from datetime import datetime, date
from typing import List, Optional
from app.models.intelligence import NotificationType

class NotificationResponse(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MarketPriceResponse(BaseModel):
    id: uuid.UUID
    commodity: str
    district: str
    wholesale_price: float
    retail_price: float
    date: date
    trend: str

    class Config:
        from_attributes = True

class RiskAlertResponse(BaseModel):
    id: uuid.UUID
    district: str
    upazila: Optional[str] = None
    risk_type: str
    severity: str
    description: str
    active_until: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    role: str # user or model
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
