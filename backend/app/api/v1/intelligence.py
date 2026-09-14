from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_farmer
from app.models.user import Farmer
from app.schemas.intelligence import (
    NotificationResponse, 
    MarketPriceResponse, 
    RiskAlertResponse,
    ChatRequest,
    ChatResponse
)
from app.services.assistant_service import chat_with_gemini
from app.services.market_service import generate_mock_market_prices
from app.services.notification_service import get_farmer_notifications, mark_notification_read, get_district_risk_alerts

router = APIRouter(tags=["Intelligence"])

@router.post("/assistant/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_farmer: Farmer = Depends(get_current_farmer)):
    response = await chat_with_gemini(request.message, request.history)
    return ChatResponse(response=response)

@router.get("/market/prices", response_model=List[MarketPriceResponse])
async def get_market_prices(
    district: str | None = None,
    current_farmer: Farmer = Depends(get_current_farmer)
):
    target_district = district or (current_farmer.profile.district if hasattr(current_farmer, "profile") and current_farmer.profile else "dhaka")
    if not target_district:
        target_district = "dhaka"
        
    prices = generate_mock_market_prices(target_district.lower())
    
    # Map to schema manually since we don't have DB objects for mock
    result = []
    for p in prices:
        result.append(
            MarketPriceResponse(
                id=uuid.uuid4(),
                commodity=p["commodity"],
                district=p["district"],
                wholesale_price=p["wholesale_price"],
                retail_price=p["retail_price"],
                date=p["date"],
                trend=p["trend"]
            )
        )
    return result

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(get_db), 
    current_farmer: Farmer = Depends(get_current_farmer)
):
    return await get_farmer_notifications(db, current_farmer.id)

@router.post("/notifications/{notification_id}/read")
async def read_notification(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_farmer: Farmer = Depends(get_current_farmer)
):
    success = await mark_notification_read(db, current_farmer.id, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@router.get("/risk/heatmap", response_model=List[RiskAlertResponse])
async def get_risk_heatmap(
    district: str,
    db: AsyncSession = Depends(get_db),
    current_farmer: Farmer = Depends(get_current_farmer)
):
    return await get_district_risk_alerts(db, district)
