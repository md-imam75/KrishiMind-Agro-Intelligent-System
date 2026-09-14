import os
from celery import Celery
from app.core.config import settings

# Initialize Celery
celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Configure autodiscover so tasks are found automatically
    include=["app.tasks.notifications"]
)
