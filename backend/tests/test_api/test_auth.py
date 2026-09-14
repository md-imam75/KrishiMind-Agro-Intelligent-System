import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_request_otp(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone": "01700000001"}
    )
    data = response.json()
    print("RESPONSE:", data)
    assert response.status_code == 200
    assert "message" in data
    
    # In DEV mode, the OTP is returned in the response
    assert "dev_otp" in data
    assert len(data["dev_otp"]) == 6

@pytest.mark.asyncio
async def test_verify_otp(client: AsyncClient):
    # Step 1: Request OTP
    phone = "01700000002"
    req_resp = await client.post(
        "/api/v1/auth/otp/request",
        json={"phone": phone}
    )
    otp = req_resp.json()["dev_otp"]
    
    # Step 2: Verify OTP
    verify_resp = await client.post(
        "/api/v1/auth/otp/verify",
        json={"phone": phone, "otp": otp}
    )
    assert verify_resp.status_code == 200
    data = verify_resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
