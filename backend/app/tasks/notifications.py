import asyncio
from app.worker import celery_app
from app.core.database import AsyncSessionLocal
from app.models.user import Farmer
from app.models.farm import FarmProfile
from app.models.intelligence import Notification, RiskAlert
from sqlalchemy import select, func
from datetime import datetime, timedelta

async def _process_broadcast(alert_data: dict):
    async with AsyncSessionLocal() as db:
        # Find all farmers in this district
        query = (
            select(Farmer.id)
            .join(FarmProfile, FarmProfile.farmer_id == Farmer.id)
            .where(func.lower(FarmProfile.district) == alert_data['district'].lower())
        )
        if alert_data.get('upazila'):
            query = query.where(func.lower(FarmProfile.upazila) == alert_data['upazila'].lower())
            
        result = await db.execute(query)
        farmer_ids = result.scalars().all()
        
        # Create notifications for each farmer
        for f_id in farmer_ids:
            n = Notification(
                farmer_id=f_id,
                title=alert_data['title'],
                message=alert_data['message'],
                type=alert_data['type']
            )
            db.add(n)
            
        # Also log it as a RiskAlert
        r = RiskAlert(
            district=alert_data['district'],
            upazila=alert_data.get('upazila'),
            risk_type=alert_data['type'],
            severity=alert_data['severity'],
            description=alert_data['message'],
            active_until=datetime.utcnow() + timedelta(days=7)
        )
        db.add(r)
        
        await db.commit()
        return len(farmer_ids)

@celery_app.task(name="broadcast_alert_task")
def broadcast_alert_task(alert_data: dict):
    """
    Celery task to broadcast alert to all farmers in a district asynchronously.
    """
    loop = asyncio.get_event_loop()
    count = loop.run_until_complete(_process_broadcast(alert_data))
    return f"Broadcasted alert to {count} farmers"
