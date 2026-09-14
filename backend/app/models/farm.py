import uuid, enum
from datetime import datetime, date
from sqlalchemy import String, Float, Boolean, DateTime, Date, ForeignKey, Text, Enum as SAEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import Farmer

class SoilType(str, enum.Enum):
    clay = "clay"
    loam = "loam"
    sandy_loam = "sandy_loam"
    silty = "silty"
    other = "other"

class WaterAvailability(str, enum.Enum):
    irrigated_canal = "irrigated_canal"
    irrigated_shallow_tube = "irrigated_shallow_tube"
    irrigated_deep_tube = "irrigated_deep_tube"
    rain_fed = "rain_fed"
    mixed = "mixed"

class LandElevation(str, enum.Enum):
    low_lying = "low_lying"
    medium = "medium"
    highland = "highland"

class GrowthStage(str, enum.Enum):
    seedling = "seedling"
    vegetative = "vegetative"
    flowering = "flowering"
    grain_filling = "grain_filling"
    maturity = "maturity"
    unknown = "unknown"

class FarmProfile(Base):
    __tablename__ = "farm_profiles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers.id"), unique=True)
    district: Mapped[str | None] = mapped_column(String(100))
    upazila: Mapped[str | None] = mapped_column(String(100))
    total_land_decimal: Mapped[float | None] = mapped_column(Float)
    is_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="profile")
    plots: Mapped[list["Plot"]] = relationship(back_populates="farm_profile")

class Plot(Base):
    __tablename__ = "plots"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farm_profiles.id"))
    label: Mapped[str] = mapped_column(String(100))
    land_decimal: Mapped[float | None] = mapped_column(Float)
    soil_type: Mapped[SoilType | None] = mapped_column(SAEnum(SoilType))
    water_availability: Mapped[WaterAvailability | None] = mapped_column(SAEnum(WaterAvailability))
    elevation: Mapped[LandElevation | None] = mapped_column(SAEnum(LandElevation))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    farm_profile: Mapped["FarmProfile"] = relationship(back_populates="plots")
    active_crops: Mapped[list["ActiveCrop"]] = relationship(back_populates="plot")
    crop_history: Mapped[list["CropHistory"]] = relationship(back_populates="plot")

class ActiveCrop(Base):
    __tablename__ = "active_crops"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plot_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plots.id"))
    crop_name: Mapped[str] = mapped_column(String(100))
    planting_date: Mapped[date | None] = mapped_column(Date)
    expected_harvest_date: Mapped[date | None] = mapped_column(Date)
    growth_stage: Mapped[GrowthStage] = mapped_column(SAEnum(GrowthStage), default=GrowthStage.unknown)
    stage_override: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    plot: Mapped["Plot"] = relationship(back_populates="active_crops")

class CropHistory(Base):
    __tablename__ = "crop_history"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plot_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("plots.id"))
    crop_name: Mapped[str] = mapped_column(String(100))
    planting_date: Mapped[date | None] = mapped_column(Date)
    harvest_date: Mapped[date | None] = mapped_column(Date)
    yield_outcome: Mapped[str | None] = mapped_column(String(20))
    notes: Mapped[str | None] = mapped_column(Text)
    is_approximate: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    plot: Mapped["Plot"] = relationship(back_populates="crop_history")
