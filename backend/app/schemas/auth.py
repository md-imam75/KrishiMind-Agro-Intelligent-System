from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class OTPRequestSchema(BaseModel):
    phone: str

class OTPVerifySchema(BaseModel):
    phone: str
    otp: str

class OfficerLoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenResponseSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    is_new_user: Optional[bool] = None

class RefreshTokenSchema(BaseModel):
    refresh_token: str

class MessageSchema(BaseModel):
    message: str
    detail: Optional[str] = None
