from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc
from app.models.intelligence import Notification, NotificationType, RiskAlert
import uuid

async def get_farmer_notifications(db: AsyncSession, farmer_id: uuid.UUID) -> list[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.farmer_id == farmer_id)
        .order_by(desc(Notification.created_at))
        .limit(20)
    )
    return result.scalars().all()

async def mark_notification_read(db: AsyncSession, farmer_id: uuid.UUID, notification_id: uuid.UUID) -> bool:
    result = await db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.farmer_id == farmer_id)
        .values(is_read=True)
    )
    await db.commit()
    return result.rowcount > 0

async def get_district_risk_alerts(db: AsyncSession, district: str) -> list[RiskAlert]:
    # In a real system, this filters by active_until > datetime.utcnow()
    # For now, return mock alerts if empty
    result = await db.execute(
        select(RiskAlert).where(RiskAlert.district == district)
    )
    alerts = result.scalars().all()
    return alerts
