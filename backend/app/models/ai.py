import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class DiseaseScanRecord(Base):
    __tablename__ = "disease_scans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=True, index=True)
    crop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    disease_name_en: Mapped[str] = mapped_column(String(150), nullable=False)
    disease_name_bn: Mapped[str] = mapped_column(String(150), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    symptoms_en: Mapped[str | None] = mapped_column(Text)
    symptoms_bn: Mapped[str | None] = mapped_column(Text)
    treatment: Mapped[dict | None] = mapped_column(JSON)
    image_path: Mapped[str | None] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

class YieldPredictionHistory(Base):
    __tablename__ = "yield_predictions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=True, index=True)
    crop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    variety: Mapped[str | None] = mapped_column(String(100))
    district: Mapped[str] = mapped_column(String(100))
    land_decimal: Mapped[float] = mapped_column(Float, nullable=False)
    soil_type: Mapped[str] = mapped_column(String(50))
    estimated_yield_kg: Mapped[float] = mapped_column(Float, nullable=False)
    actual_yield_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
