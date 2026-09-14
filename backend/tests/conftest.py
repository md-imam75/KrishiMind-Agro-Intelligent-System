import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings

# Use a separate test database URL if possible, otherwise use the regular one and rollback
# For simplicity in this project, we'll use the regular db URL but within a rollback transaction
TEST_DB_URL = settings.DATABASE_URL

engine = create_async_engine(TEST_DB_URL, echo=False)
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session")
def event_loop():
    import asyncio
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    # Setup - normally you'd create tables here if not using alembic for tests
    yield
    # Teardown
    await engine.dispose()

@pytest_asyncio.fixture
async def db_session():
    """Provides a transactional database session that rolls back after each test."""
    async with engine.begin() as connection:
        session = TestingSessionLocal(bind=connection)
        yield session
        await session.close()
        await connection.rollback()

@pytest_asyncio.fixture
async def client(db_session):
    """Provides an async HTTP client that overrides the get_db dependency."""
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client
        
    app.dependency_overrides.clear()
