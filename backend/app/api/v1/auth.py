from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.models.user import Officer
from app.schemas.auth import OTPRequestSchema, OTPVerifySchema, OfficerLoginSchema, TokenResponseSchema, RefreshTokenSchema, MessageSchema
from app.services import auth_service

router = APIRouter()

@router.post("/otp/request")
async def request_otp(data: OTPRequestSchema, db: AsyncSession = Depends(get_db)):
    """Request OTP for login/registration. Rate limited."""
    try:
        result = await auth_service.request_otp(data.phone, db)
        return {"message": "OTP sent successfully", **result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/otp/verify", response_model=TokenResponseSchema)
async def verify_otp(data: OTPVerifySchema, db: AsyncSession = Depends(get_db)):
    """Verify OTP and return tokens."""
    try:
        result = await auth_service.verify_otp(data.phone, data.otp, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/officer/login", response_model=TokenResponseSchema)
async def officer_login(data: OfficerLoginSchema, db: AsyncSession = Depends(get_db)):
    """Login for officers/admins."""
    result = await db.execute(select(Officer).where(Officer.email == data.email, Officer.is_active == True))
    officer = result.scalar_one_or_none()
    
    if not officer or not verify_password(data.password, officer.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token_id = str(uuid.uuid4())
    access_token = create_access_token({"sub": str(officer.id), "role": officer.role, "email": officer.email})
    refresh_token = create_refresh_token(str(officer.id), token_id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": officer.role
    }

@router.post("/refresh", response_model=TokenResponseSchema)
async def refresh_token(data: RefreshTokenSchema, db: AsyncSession = Depends(get_db)):
    """Refresh farmer token."""
    try:
        result = await auth_service.refresh_farmer_token(data.refresh_token, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout", response_model=MessageSchema)
async def logout(data: RefreshTokenSchema, db: AsyncSession = Depends(get_db)):
    """Logout farmer."""
    await auth_service.logout_farmer(data.refresh_token, db)
    return {"message": "Logged out successfully"}
