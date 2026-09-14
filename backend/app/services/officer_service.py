from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.models.user import Farmer, Officer
from app.models.farm import FarmProfile, Plot, ActiveCrop
from app.models.intelligence import Notification, RiskAlert
from app.schemas.officer import FarmerSummary, DistrictStats, AlertCreate, HeatmapData
from datetime import datetime, timedelta
import uuid
import random

async def get_district_stats(db: AsyncSession, district: str) -> DistrictStats:
    # Get total farmers in this district
    farmers_query = select(func.count(FarmProfile.id)).where(
        func.lower(FarmProfile.district) == district.lower()
    )
    total_farmers = (await db.execute(farmers_query)).scalar() or 0
    
    # Active crops in this district
    crops_query = (
        select(func.count(ActiveCrop.id))
        .select_from(ActiveCrop)
        .join(Plot)
        .join(FarmProfile)
        .where(
            func.lower(FarmProfile.district) == district.lower(),
            ActiveCrop.is_active == True
        )
    )
    active_crops_count = (await db.execute(crops_query)).scalar() or 0
    
    # Critical alerts count
    alerts_query = select(func.count(RiskAlert.id)).where(
        func.lower(RiskAlert.district) == district.lower(),
        RiskAlert.severity == "critical"
    )
    critical_alerts = (await db.execute(alerts_query)).scalar() or 0
    
    return DistrictStats(
        total_farmers=total_farmers,
        active_crops_count=active_crops_count,
        critical_alerts=critical_alerts,
        recent_onboardings=total_farmers  # simplified
    )

async def get_district_farmers(db: AsyncSession, district: str) -> list[FarmerSummary]:
    # Use explicit join via foreign key
    query = (
        select(Farmer, FarmProfile)
        .join(FarmProfile, FarmProfile.farmer_id == Farmer.id)
        .where(func.lower(FarmProfile.district) == district.lower())
    )
    result = await db.execute(query)
    
    farmers = []
    for f, profile in result.all():
        # Count active crops for this farmer
        c_query = (
            select(func.count(ActiveCrop.id))
            .select_from(ActiveCrop)
            .join(Plot)
            .where(Plot.farm_profile_id == profile.id, ActiveCrop.is_active == True)
        )
        crops_cnt = (await db.execute(c_query)).scalar() or 0
        
        farmers.append(FarmerSummary(
            id=f.id,
            phone=f.phone,
            name=f.name,
            district=profile.district,
            upazila=profile.upazila,
            total_land=profile.total_land_decimal,
            active_crops=crops_cnt,
            is_complete=profile.is_complete
        ))
    return farmers

async def generate_heatmap_data(db: AsyncSession, base_district: str) -> list[HeatmapData]:
    # Generate heatmap data for surrounding districts
    districts = list(set([base_district, "gazipur", "narayanganj", "manikganj", "tangail", "munshiganj"]))
    data = []
    for d in districts:
        # Count farmers per district as a proxy for activity
        farmer_count = (await db.execute(
            select(func.count(FarmProfile.id)).where(func.lower(FarmProfile.district) == d.lower())
        )).scalar() or 0
        
        score = min(0.9, max(0.1, farmer_count * 0.1 + random.uniform(0.1, 0.3)))
        risk = "Flood" if score > 0.7 else "Pest" if score > 0.5 else "None"
        data.append(HeatmapData(
            district=d,
            risk_score=round(score, 2),
            dominant_risk=risk
        ))
    return data

from app.tasks.notifications import broadcast_alert_task

async def broadcast_alert(db: AsyncSession, alert: AlertCreate, officer: Officer):
    # Dispatch Celery task
    alert_data = alert.model_dump()
    broadcast_alert_task.delay(alert_data)
    
    return {"message": "Alert broadcast queued for processing."}
