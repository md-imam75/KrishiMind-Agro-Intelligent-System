from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_officer
from app.models.user import Officer
from app.schemas.officer import DistrictStats, FarmerSummary, HeatmapData, AlertCreate
from app.services import officer_service

router = APIRouter(tags=["Officer Portal"])

@router.get("/stats", response_model=DistrictStats)
async def get_stats(db: AsyncSession = Depends(get_db), current_officer: Officer = Depends(get_current_officer)):
    district = current_officer.district or "dhaka"
    return await officer_service.get_district_stats(db, district)

@router.get("/farmers", response_model=list[FarmerSummary])
async def get_farmers(db: AsyncSession = Depends(get_db), current_officer: Officer = Depends(get_current_officer)):
    district = current_officer.district or "dhaka"
    return await officer_service.get_district_farmers(db, district)

@router.get("/heatmap", response_model=list[HeatmapData])
async def get_heatmap(db: AsyncSession = Depends(get_db), current_officer: Officer = Depends(get_current_officer)):
    district = current_officer.district or "dhaka"
    return await officer_service.generate_heatmap_data(db, district)

@router.post("/alerts")
async def broadcast_alert(alert: AlertCreate, db: AsyncSession = Depends(get_db), current_officer: Officer = Depends(get_current_officer)):
    # Optional: enforce officer can only broadcast to their own district
    # if current_officer.role == UserRole.district_officer and alert.district != current_officer.district:
    #     raise HTTPException(status_code=403)
    return await officer_service.broadcast_alert(db, alert, current_officer)
