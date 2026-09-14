from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date
from uuid import UUID
from app.models.farm import SoilType, WaterAvailability, LandElevation, GrowthStage

class FarmProfileUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    total_land_decimal: Optional[float] = None

class ActiveCropResponse(BaseModel):
    id: UUID
    crop_name: str
    planting_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    growth_stage: GrowthStage = GrowthStage.unknown

    model_config = ConfigDict(from_attributes=True)

class PlotCreate(BaseModel):
    label: str
    land_decimal: Optional[float] = None
    soil_type: Optional[SoilType] = None
    water_availability: Optional[WaterAvailability] = None
    elevation: Optional[LandElevation] = None

class PlotUpdate(BaseModel):
    label: Optional[str] = None
    land_decimal: Optional[float] = None
    soil_type: Optional[SoilType] = None
    water_availability: Optional[WaterAvailability] = None
    elevation: Optional[LandElevation] = None

class PlotResponse(BaseModel):
    id: UUID
    label: str
    land_decimal: Optional[float]
    soil_type: Optional[SoilType]
    water_availability: Optional[WaterAvailability]
    elevation: Optional[LandElevation]
    is_active: bool
    active_crop: Optional[ActiveCropResponse] = None

    model_config = ConfigDict(from_attributes=True)

class FarmProfileResponse(BaseModel):
    id: UUID
    farmer_name: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    total_land_decimal: Optional[float] = None
    is_complete: bool
    plots: List[PlotResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class ActiveCropCreate(BaseModel):
    crop_name: str
    planting_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None

class CropHistoryCreate(BaseModel):
    crop_name: str
    planting_date: Optional[date] = None
    harvest_date: Optional[date] = None
    yield_outcome: Optional[str] = None
    notes: Optional[str] = None
    is_approximate: bool = False

class CropHistoryResponse(BaseModel):
    id: UUID
    crop_name: str
    planting_date: Optional[date]
    harvest_date: Optional[date]
    yield_outcome: Optional[str]
    notes: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class CompletenessResponse(BaseModel):
    profile_complete: bool
    has_plots: bool
    active_plots: int
    missing_fields: List[str]
