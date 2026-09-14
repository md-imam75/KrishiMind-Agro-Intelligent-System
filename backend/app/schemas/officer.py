from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
import uuid

class FarmerSummary(BaseModel):
    id: uuid.UUID
    phone: str
    name: Optional[str]
    district: Optional[str]
    upazila: Optional[str]
    total_land: Optional[float]
    active_crops: int
    is_complete: bool

    model_config = ConfigDict(from_attributes=True)

class DistrictStats(BaseModel):
    total_farmers: int
    active_crops_count: int
    critical_alerts: int
    recent_onboardings: int

class AlertCreate(BaseModel):
    district: str
    upazila: Optional[str] = None
    title: str
    message: str
    severity: str = "warning" # info, warning, critical
    type: str = "alert" # alert, weather, market, general

class HeatmapData(BaseModel):
    district: str
    risk_score: float # 0.0 to 1.0
    dominant_risk: Optional[str] = None
