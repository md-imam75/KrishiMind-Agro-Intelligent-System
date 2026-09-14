import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.farm import FarmProfile, Plot, ActiveCrop, CropHistory
from app.models.user import Farmer
from app.schemas.farm import (
    FarmProfileUpdate, 
    FarmProfileResponse,
    PlotCreate, 
    PlotUpdate, 
    PlotResponse,
    ActiveCropCreate, 
    ActiveCropResponse,
    CropHistoryCreate, 
    CropHistoryResponse,
    CompletenessResponse
)
from datetime import datetime

async def get_or_create_profile(farmer_id: uuid.UUID, db: AsyncSession) -> FarmProfile:
    result = await db.execute(select(FarmProfile).where(FarmProfile.farmer_id == farmer_id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = FarmProfile(farmer_id=farmer_id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile

async def update_profile(farmer_id: uuid.UUID, data: FarmProfileUpdate, db: AsyncSession) -> FarmProfileResponse:
    profile = await get_or_create_profile(farmer_id, db)
    
    # Update farmer name if provided
    if data.name is not None:
        await db.execute(update(Farmer).where(Farmer.id == farmer_id).values(name=data.name))
    
    # Update profile fields
    if data.district is not None:
        profile.district = data.district
    if data.upazila is not None:
        profile.upazila = data.upazila
    if data.total_land_decimal is not None:
        profile.total_land_decimal = data.total_land_decimal
    
    # Re-evaluate completeness
    profile.is_complete = bool(profile.district and profile.upazila and profile.total_land_decimal)
    
    await db.commit()
    await db.refresh(profile)
    return await get_full_profile(farmer_id, db)

async def get_full_profile(farmer_id: uuid.UUID, db: AsyncSession) -> FarmProfileResponse:
    profile = await get_or_create_profile(farmer_id, db)
    farmer_res = await db.execute(select(Farmer).where(Farmer.id == farmer_id))
    farmer = farmer_res.scalar_one()

    plots = await get_plots(profile.id, db)

    return FarmProfileResponse(
        id=profile.id,
        farmer_name=farmer.name,
        phone=farmer.phone,
        district=profile.district,
        upazila=profile.upazila,
        total_land_decimal=profile.total_land_decimal,
        is_complete=profile.is_complete,
        plots=plots,
    )

async def get_profile(farmer_id: uuid.UUID, db: AsyncSession) -> FarmProfileResponse:
    return await get_full_profile(farmer_id, db)

async def check_completeness(farmer_id: uuid.UUID, db: AsyncSession) -> CompletenessResponse:
    profile = await get_or_create_profile(farmer_id, db)
    result = await db.execute(select(Plot).where(Plot.farm_profile_id == profile.id, Plot.is_active == True))
    plots = result.scalars().all()
    
    missing = []
    farmer_res = await db.execute(select(Farmer).where(Farmer.id == farmer_id))
    farmer = farmer_res.scalar_one()
    if not farmer.name: missing.append("name")
    
    if not profile.district: missing.append("district")
    if not profile.upazila: missing.append("upazila")
    if not profile.total_land_decimal: missing.append("total_land_decimal")
    
    return CompletenessResponse(
        profile_complete=len(missing) == 0,
        has_plots=len(plots) > 0,
        active_plots=len(plots),
        missing_fields=missing
    )

async def create_plot(farm_profile_id: uuid.UUID, data: PlotCreate, db: AsyncSession) -> PlotResponse:
    plot = Plot(
        farm_profile_id=farm_profile_id,
        label=data.label,
        land_decimal=data.land_decimal,
        soil_type=data.soil_type,
        water_availability=data.water_availability,
        elevation=data.elevation
    )
    db.add(plot)
    await db.commit()
    await db.refresh(plot)
    return PlotResponse(
        id=plot.id,
        label=plot.label,
        land_decimal=plot.land_decimal,
        soil_type=plot.soil_type,
        water_availability=plot.water_availability,
        elevation=plot.elevation,
        is_active=plot.is_active,
        active_crop=None
    )

async def _verify_plot_ownership(plot_id: uuid.UUID, farmer_id: uuid.UUID, db: AsyncSession) -> Plot:
    result = await db.execute(
        select(Plot)
        .join(FarmProfile, Plot.farm_profile_id == FarmProfile.id)
        .where(Plot.id == plot_id, FarmProfile.farmer_id == farmer_id, Plot.is_active == True)
    )
    plot = result.scalar_one_or_none()
    if not plot:
        raise ValueError("Plot not found or not owned by farmer")
    return plot

async def update_plot(plot_id: uuid.UUID, farmer_id: uuid.UUID, data: PlotUpdate, db: AsyncSession) -> PlotResponse:
    plot = await _verify_plot_ownership(plot_id, farmer_id, db)
    
    if data.label is not None: plot.label = data.label
    if data.land_decimal is not None: plot.land_decimal = data.land_decimal
    if data.soil_type is not None: plot.soil_type = data.soil_type
    if data.water_availability is not None: plot.water_availability = data.water_availability
    if data.elevation is not None: plot.elevation = data.elevation
    
    await db.commit()
    await db.refresh(plot)
    active_crop = await get_active_crop(plot.id, db)
    return PlotResponse(
        id=plot.id,
        label=plot.label,
        land_decimal=plot.land_decimal,
        soil_type=plot.soil_type,
        water_availability=plot.water_availability,
        elevation=plot.elevation,
        is_active=plot.is_active,
        active_crop=ActiveCropResponse.model_validate(active_crop) if active_crop else None
    )

async def get_plots(farm_profile_id: uuid.UUID, db: AsyncSession) -> list[PlotResponse]:
    result = await db.execute(select(Plot).where(Plot.farm_profile_id == farm_profile_id, Plot.is_active == True))
    plots = result.scalars().all()
    plot_responses = []
    for p in plots:
        active_crop = await get_active_crop(p.id, db)
        plot_responses.append(
            PlotResponse(
                id=p.id,
                label=p.label,
                land_decimal=p.land_decimal,
                soil_type=p.soil_type,
                water_availability=p.water_availability,
                elevation=p.elevation,
                is_active=p.is_active,
                active_crop=ActiveCropResponse.model_validate(active_crop) if active_crop else None
            )
        )
    return plot_responses

async def set_active_crop(plot_id: uuid.UUID, farmer_id: uuid.UUID, data: ActiveCropCreate, db: AsyncSession) -> ActiveCropResponse:
    plot = await _verify_plot_ownership(plot_id, farmer_id, db)
    
    # Deactivate existing
    await db.execute(
        update(ActiveCrop)
        .where(ActiveCrop.plot_id == plot_id, ActiveCrop.is_active == True)
        .values(is_active=False)
    )
    
    crop = ActiveCrop(
        plot_id=plot.id,
        crop_name=data.crop_name,
        planting_date=data.planting_date,
        expected_harvest_date=data.expected_harvest_date
    )
    db.add(crop)
    await db.commit()
    await db.refresh(crop)
    return ActiveCropResponse.model_validate(crop)

async def get_active_crop(plot_id: uuid.UUID, db: AsyncSession) -> ActiveCrop | None:
    result = await db.execute(select(ActiveCrop).where(ActiveCrop.plot_id == plot_id, ActiveCrop.is_active == True))
    return result.scalar_one_or_none()

async def harvest_crop(plot_id: uuid.UUID, farmer_id: uuid.UUID, db: AsyncSession) -> None:
    plot = await _verify_plot_ownership(plot_id, farmer_id, db)
    active_crop = await get_active_crop(plot_id, db)
    if not active_crop:
        raise ValueError("No active crop to harvest")
    
    active_crop.is_active = False
    
    history = CropHistory(
        plot_id=plot.id,
        crop_name=active_crop.crop_name,
        planting_date=active_crop.planting_date,
        harvest_date=datetime.utcnow().date(),
        is_approximate=False
    )
    db.add(history)
    await db.commit()

async def get_crop_history(plot_id: uuid.UUID, db: AsyncSession) -> list[CropHistoryResponse]:
    result = await db.execute(select(CropHistory).where(CropHistory.plot_id == plot_id).order_by(CropHistory.created_at.desc()))
    hist = result.scalars().all()
    return [CropHistoryResponse.model_validate(h) for h in hist]

async def get_all_farmer_crop_history(farmer_id: uuid.UUID, db: AsyncSession) -> list[CropHistoryResponse]:
    result = await db.execute(
        select(CropHistory)
        .join(Plot, CropHistory.plot_id == Plot.id)
        .join(FarmProfile, Plot.farm_profile_id == FarmProfile.id)
        .where(FarmProfile.farmer_id == farmer_id)
        .order_by(CropHistory.created_at.desc())
    )
    hist = result.scalars().all()
    return [CropHistoryResponse.model_validate(h) for h in hist]

async def add_crop_history(plot_id: uuid.UUID, farmer_id: uuid.UUID, data: CropHistoryCreate, db: AsyncSession) -> CropHistoryResponse:
    plot = await _verify_plot_ownership(plot_id, farmer_id, db)
    history = CropHistory(
        plot_id=plot.id,
        crop_name=data.crop_name,
        planting_date=data.planting_date,
        harvest_date=data.harvest_date,
        yield_outcome=data.yield_outcome,
        notes=data.notes,
        is_approximate=data.is_approximate
    )
    db.add(history)
    await db.commit()
    await db.refresh(history)
    return CropHistoryResponse.model_validate(history)
