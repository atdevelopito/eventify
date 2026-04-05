
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('JWT_SECRET')
    MONGO_URI = os.getenv('MONGODB_URI')
    RESEND_SMTP_HOST = os.getenv('RESEND_SMTP_HOST')
    RESEND_SMTP_PORT = int(os.getenv('RESEND_SMTP_PORT', 465))
    RESEND_SMTP_USER = os.getenv('RESEND_SMTP_USER')
    RESEND_SMTP_PASS = os.getenv('RESEND_SMTP_PASS')
    
    # Frontend URLs
    ORGANIZER_URL = os.getenv('ORGANIZER_URL', 'http://localhost:5174')

    # Flask-Limiter storage
    RATELIMIT_STORAGE_URI = os.getenv('MONGODB_URI')

    # Redis & Celery
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    # Optimization for Free Plan (Run tasks synchronously in web thread)
    CELERY_TASK_ALWAYS_EAGER = os.getenv('CELERY_TASK_ALWAYS_EAGER', 'false').lower() == 'true'
