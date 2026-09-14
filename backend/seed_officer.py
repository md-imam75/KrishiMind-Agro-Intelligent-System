import asyncio
import bcrypt
from app.core.database import AsyncSessionLocal
from app.models.user import Officer, UserRole
from sqlalchemy import select

async def seed():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Officer).where(Officer.email == 'admin@krishimind.gov.bd'))
        existing = result.scalar_one_or_none()
        if existing:
            print(f'Officer already exists: {existing.id}')
        else:
            hashed = bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8')
            officer = Officer(
                email='admin@krishimind.gov.bd',
                hashed_password=hashed,
                name='Admin Officer',
                role=UserRole.district_officer,
                district='dhaka',
                region='dhaka',
                is_active=True
            )
            db.add(officer)
            await db.commit()
            print(f'Created officer: {officer.id}')

if __name__ == "__main__":
    asyncio.run(seed())
