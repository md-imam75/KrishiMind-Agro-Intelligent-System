import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_farmer
from app.models.user import Farmer
from app.models.ai import DiseaseScanRecord, YieldPredictionHistory
from app.schemas.ai import (
    CropRecommendationRequest, CropRecommendationResponse,
    DiseaseScanResponse, DiseaseHistoryItem,
    YieldPredictionRequest, YieldPredictionResponse,
    WeatherResponse, AgriculturalAdvisory
)
from app.services import crop_service, disease_service, yield_service, weather_service

router = APIRouter()

# --- 1. Crop Recommendation Endpoint ---
@router.post("/crop-recommendation", response_model=CropRecommendationResponse)
async def recommend_crops(req: CropRecommendationRequest):
    """
    Recommend best crops based on district, soil type, season, water, and elevation.
    """
    return crop_service.recommend_crops(req)

# --- 2. Leaf Disease Scanner Endpoints ---
@router.post("/disease/scan", response_model=DiseaseScanResponse)
async def scan_disease(
    image: UploadFile = File(...),
    crop_hint: str = Form("rice"),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload and diagnose a crop leaf image for pests or diseases with organic/chemical remedies.
    """
    contents = await image.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit")

    # Diagnose image
    diagnosis = await disease_service.diagnose_leaf_image(crop_hint, contents, image.filename or "leaf.jpg")

    # Save record to DB
    record = DiseaseScanRecord(
        id=uuid.UUID(diagnosis.id),
        crop_name=diagnosis.crop_name,
        disease_name_en=diagnosis.disease_name_en,
        disease_name_bn=diagnosis.disease_name_bn,
        confidence=diagnosis.confidence,
        severity=diagnosis.severity,
        symptoms_en=diagnosis.symptoms_en,
        symptoms_bn=diagnosis.symptoms_bn,
        treatment=diagnosis.treatment.dict(),
    )
    db.add(record)
    await db.commit()

    return diagnosis

@router.get("/disease/history", response_model=List[DiseaseHistoryItem])
async def get_scan_history(db: AsyncSession = Depends(get_db)):
    """
    Retrieve past disease scans.
    """
    result = await db.execute(
        select(DiseaseScanRecord).order_by(DiseaseScanRecord.created_at.desc()).limit(20)
    )
    records = result.scalars().all()
    return [
        DiseaseHistoryItem(
            id=str(r.id),
            crop_name=r.crop_name,
            disease_name_bn=r.disease_name_bn,
            disease_name_en=r.disease_name_en,
            severity=r.severity,
            confidence=r.confidence,
            created_at=r.created_at,
            image_url=r.image_path,
        )
        for r in records
    ]

# --- 3. Yield Prediction Endpoints ---
@router.post("/yield-prediction", response_model=YieldPredictionResponse)
async def predict_crop_yield(
    req: YieldPredictionRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Estimate expected harvest yield and gross revenue.
    """
    prediction = yield_service.predict_yield(req)

    # Log history
    hist = YieldPredictionHistory(
        crop_name=req.crop_name,
        variety=req.variety,
        district=req.district,
        land_decimal=req.land_decimal,
        soil_type=req.soil_type,
        estimated_yield_kg=prediction.estimated_yield_kg,
    )
    db.add(hist)
    await db.commit()

    return prediction

# --- 4. Weather & Agricultural Advisory Endpoints ---
@router.get("/weather/{district}", response_model=WeatherResponse)
async def get_district_weather(district: str):
    """
    Get 7-day agro-weather forecast and spray/irrigation advisories for any Bangladesh district.
    """
    return await weather_service.get_weather_forecast(district)

@router.get("/weather/{district}/advisory", response_model=AgriculturalAdvisory)
async def get_district_advisory(district: str):
    """
    Get specific spray, irrigation, and pest risk advisories for a district.
    """
    weather = await weather_service.get_weather_forecast(district)
    return weather.advisory
