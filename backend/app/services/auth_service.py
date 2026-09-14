import hashlib, uuid, secrets
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.user import Farmer, OTPVerification, RefreshToken
from app.core.security import generate_otp, create_access_token, create_refresh_token, verify_token
from app.core.config import settings

def hash_value(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()

async def request_otp(phone: str, db: AsyncSession) -> dict:
    """Generate OTP, store hashed, return dev info."""
    normalized = phone.strip().replace(" ", "").replace("-", "")
    if not normalized.startswith("+880"):
        if normalized.startswith("01"):
            normalized = "+880" + normalized[1:]
    
    otp = generate_otp()
    otp_hash = hash_value(otp)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    
    # Invalidate existing OTPs for this phone
    await db.execute(
        update(OTPVerification)
        .where(OTPVerification.phone == normalized, OTPVerification.used == False)
        .values(used=True)
    )
    
    otp_record = OTPVerification(
        phone=normalized,
        otp_hash=otp_hash,
        expires_at=expires_at
    )
    db.add(otp_record)
    await db.commit()
    
    if settings.OTP_DEV_MODE:
        print(f"[DEV OTP] Phone: {normalized} | OTP: {otp}")
    
    return {"phone": normalized, "dev_otp": otp if settings.OTP_DEV_MODE else None}

async def verify_otp(phone: str, otp: str, db: AsyncSession) -> dict:
    """Verify OTP, create/get farmer, return tokens."""
    normalized = phone.strip().replace(" ", "").replace("-", "")
    if not normalized.startswith("+880"):
        if normalized.startswith("01"):
            normalized = "+880" + normalized[1:]
    
    otp_hash = hash_value(otp)
    now = datetime.utcnow()
    
    result = await db.execute(
        select(OTPVerification).where(
            OTPVerification.phone == normalized,
            OTPVerification.used == False,
            OTPVerification.expires_at > now
        ).order_by(OTPVerification.created_at.desc())
    )
    otp_record = result.scalar_one_or_none()
    
    if not otp_record:
        raise ValueError("OTP expired or not found")
    
    if otp_record.attempts >= settings.OTP_MAX_ATTEMPTS:
        raise ValueError("Too many failed attempts")
    
    if otp_record.otp_hash != otp_hash:
        otp_record.attempts += 1
        await db.commit()
        raise ValueError("Invalid OTP")
    
    otp_record.used = True
    await db.commit()
    
    # Get or create farmer
    result = await db.execute(select(Farmer).where(Farmer.phone == normalized))
    farmer = result.scalar_one_or_none()
    is_new = False
    if not farmer:
        farmer = Farmer(phone=normalized)
        db.add(farmer)
        await db.commit()
        await db.refresh(farmer)
        is_new = True
    
    return await _issue_farmer_tokens(farmer, db, is_new)

async def _issue_farmer_tokens(farmer: Farmer, db: AsyncSession, is_new: bool = False) -> dict:
    token_id = str(uuid.uuid4())
    access_token = create_access_token({"sub": str(farmer.id), "role": "farmer", "phone": farmer.phone})
    refresh_token = create_refresh_token(str(farmer.id), token_id)
    
    expires_at = datetime.utcnow() + timedelta(days=settings.FARMER_REFRESH_TOKEN_EXPIRE_DAYS)
    rt = RefreshToken(
        farmer_id=farmer.id,
        token_hash=hash_value(refresh_token),
        expires_at=expires_at
    )
    db.add(rt)
    await db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": "farmer",
        "is_new_user": is_new
    }

async def refresh_farmer_token(refresh_token: str, db: AsyncSession) -> dict:
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise ValueError("Invalid refresh token")
    
    token_hash = hash_value(refresh_token)
    now = datetime.utcnow()
    
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > now
        )
    )
    rt = result.scalar_one_or_none()
    if not rt:
        raise ValueError("Refresh token revoked or expired")
    
    # Rotate
    rt.revoked = True
    await db.commit()
    
    result = await db.execute(select(Farmer).where(Farmer.id == rt.farmer_id, Farmer.is_active == True))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise ValueError("Farmer not found")
    
    return await _issue_farmer_tokens(farmer, db)

async def logout_farmer(refresh_token: str, db: AsyncSession) -> None:
    token_hash = hash_value(refresh_token)
    await db.execute(
        update(RefreshToken).where(RefreshToken.token_hash == token_hash).values(revoked=True)
    )
    await db.commit()
