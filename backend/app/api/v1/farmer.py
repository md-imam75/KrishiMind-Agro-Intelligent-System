from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.core.database import get_db
from app.core.dependencies import get_current_farmer
from app.models.user import Farmer
from app.schemas.farm import (
    FarmProfileResponse, FarmProfileUpdate, CompletenessResponse,
    PlotResponse, PlotCreate, PlotUpdate,
    ActiveCropResponse, ActiveCropCreate,
    CropHistoryResponse, CropHistoryCreate
)
from app.schemas.auth import MessageSchema
from app.services import farm_service

router = APIRouter()

@router.get("/profile", response_model=FarmProfileResponse)
async def get_profile(current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Get farmer profile."""
    return await farm_service.get_profile(current_farmer.id, db)

@router.put("/profile", response_model=FarmProfileResponse)
async def update_profile(data: FarmProfileUpdate, current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Update farmer profile."""
    return await farm_service.update_profile(current_farmer.id, data, db)

@router.get("/profile/completeness", response_model=CompletenessResponse)
async def check_completeness(current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Check profile completeness."""
    return await farm_service.check_completeness(current_farmer.id, db)

@router.get("/plots", response_model=list[PlotResponse])
async def get_plots(current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """List farmer's plots."""
    profile = await farm_service.get_profile(current_farmer.id, db)
    return await farm_service.get_plots(profile.id, db)

@router.post("/plots", response_model=PlotResponse)
async def create_plot(data: PlotCreate, current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Create a new plot."""
    profile = await farm_service.get_profile(current_farmer.id, db)
    return await farm_service.create_plot(profile.id, data, db)

@router.put("/plots/{plot_id}", response_model=PlotResponse)
async def update_plot(plot_id: uuid.UUID, data: PlotUpdate, current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Update an existing plot."""
    try:
        return await farm_service.update_plot(plot_id, current_farmer.id, data, db)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/plots/{plot_id}/crop")
async def get_active_crop(plot_id: uuid.UUID, current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Get active crop for a plot."""
    try:
        await farm_service._verify_plot_ownership(plot_id, current_farmer.id, db)
        crop = await farm_service.get_active_crop(plot_id, db)
        if not crop:
            return None
        return ActiveCropResponse.model_validate(crop)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/plots/{plot_id}/crop", response_model=ActiveCropResponse)
async def set_active_crop(plot_id: uuid.UUID, data: ActiveCropCreate, current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Set active crop for a plot."""
    try:
        return await farm_service.set_active_crop(plot_id, current_farmer.id, data, db)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/plots/{plot_id}/harvest", response_model=MessageSchema)
async def harvest_crop(plot_id: uuid.UUID, current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Mark current active crop as harvested."""
    try:
        await farm_service.harvest_crop(plot_id, current_farmer.id, db)
        return {"message": "Crop harvested successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=list[CropHistoryResponse])
async def get_all_history(current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Get all past crop history across all plots of current farmer."""
    return await farm_service.get_all_farmer_crop_history(current_farmer.id, db)

@router.get("/plots/{plot_id}/history", response_model=list[CropHistoryResponse])
async def get_crop_history(plot_id: uuid.UUID, current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Get crop history for a plot."""
    try:
        await farm_service._verify_plot_ownership(plot_id, current_farmer.id, db)
        return await farm_service.get_crop_history(plot_id, db)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/plots/{plot_id}/history", response_model=CropHistoryResponse)
async def add_crop_history(plot_id: uuid.UUID, data: CropHistoryCreate, current_farmer: Farmer = Depends(get_current_farmer), db: AsyncSession = Depends(get_db)):
    """Manually add a past crop to history."""
    try:
        return await farm_service.add_crop_history(plot_id, current_farmer.id, data, db)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
