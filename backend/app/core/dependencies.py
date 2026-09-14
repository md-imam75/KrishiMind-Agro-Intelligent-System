from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import Farmer, Officer, UserRole
from sqlalchemy import select
import uuid

security = HTTPBearer()

async def get_current_farmer(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)) -> Farmer:
    payload = verify_token(credentials.credentials)
    if not payload or payload.get("type") != "access" or payload.get("role") != "farmer":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    farmer_id = payload.get("sub")
    result = await db.execute(select(Farmer).where(Farmer.id == uuid.UUID(farmer_id), Farmer.is_active == True))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=401, detail="Farmer not found")
    return farmer

async def get_current_officer(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)) -> Officer:
    payload = verify_token(credentials.credentials)
    if not payload or payload.get("type") != "access" or payload.get("role") not in ["district_officer", "regional_admin", "super_admin"]:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    officer_id = payload.get("sub")
    result = await db.execute(select(Officer).where(Officer.id == uuid.UUID(officer_id), Officer.is_active == True))
    officer = result.scalar_one_or_none()
    if not officer:
        raise HTTPException(status_code=401, detail="Officer not found")
    return officer

async def require_super_admin(officer: Officer = Depends(get_current_officer)) -> Officer:
    if officer.role != UserRole.super_admin:
        raise HTTPException(status_code=403, detail="Super admin access required")
    return officer
