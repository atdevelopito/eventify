"""
Performance utilities for the Eventify API.
Includes Redis caching decorators and data projection helpers.
"""
import json
import functools
from flask import request, jsonify
from redis import Redis
from src.config import Config

# Initialize shared Redis connection
redis_client = Redis.from_url(Config.REDIS_URL, decode_responses=True)

def cache_api_response(timeout=300, key_prefix='api_cache'):
    """
    Decorator to cache API responses in Redis.
    Generates a unique key based on the request URL and query parameters.
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Don't cache on non-GET requests
            if request.method != 'GET':
                return f(*args, **kwargs)
            
            # Create a unique cache key
            cache_key = f"{key_prefix}:{request.full_path}"
            
            try:
                # Try to fetch from Redis
                cached_val = redis_client.get(cache_key)
                if cached_val:
                    return jsonify(json.loads(cached_val)), 200
            except Exception as e:
                # Redis connection error? Just log and proceed to execute the function
                print(f"[CACHE] Redis error (get): {e}")

            # Execute original function
            response, status_code = f(*args, **kwargs)
            
            # Cache the response if it was successful (200 OK)
            try:
                if status_code == 200:
                    data = response.get_json() if hasattr(response, 'get_json') else response
                    redis_client.setex(cache_key, timeout, json.dumps(data))
            except Exception as e:
                print(f"[CACHE] Redis error (set): {e}")
                
            return response, status_code
        return decorated_function
    return decorator

def invalidate_cache(key_pattern):
    try:
        keys = redis_client.keys(key_pattern)
        if keys:
            redis_client.delete(*keys)
    except Exception as e:
        print(f"[CACHE] Redis error (invalidate): {e}")
