import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, DateTime, Date, Float, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum

class NotificationType(str, enum.Enum):
    alert = "alert"
    weather = "weather"
    market = "market"
    general = "general"

class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[NotificationType] = mapped_column(SAEnum(NotificationType), default=NotificationType.general)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class MarketPrice(Base):
    __tablename__ = "market_prices"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commodity: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    wholesale_price: Mapped[float] = mapped_column(Float, nullable=False)
    retail_price: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    trend: Mapped[str] = mapped_column(String(20), default="stable") # up, down, stable

class RiskAlert(Base):
    __tablename__ = "risk_alerts"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    upazila: Mapped[str | None] = mapped_column(String(100))
    risk_type: Mapped[str] = mapped_column(String(50), nullable=False) # disease, pest, weather
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # high, medium, low
    description: Mapped[str] = mapped_column(Text, nullable=False)
    active_until: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
