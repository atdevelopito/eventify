from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

# Create a globally shared rate limiter backed by Redis for multi-worker environments
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("REDIS_URL", "memory://"), # Falls back to local memory if Redis is missing
    strategy="fixed-window" # or "moving-window" for more precision
)
