from pymongo import MongoClient
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client.eventify
    
    # Check for existing users to attribute the event to
    user = db.users.find_one()
    
    user_id = user['_id'] if user else ObjectId()
    user_name = user.get('name', 'Test Organizer') if user else 'Test Organizer'

    dummy_event = {
        "title": "Grand Opening Concert",
        "description": "Join us for an amazing night of music and celebration! This is a test event to demonstrate the new features.",
        "date": "October 15, 2026",
        "time": "7:00 PM",
        "start_date": "2026-10-15",
        "start_time": "19:00",
        "end_date": "2026-10-15",
        "end_time": "23:00",
        "location": "Bangladesh National Museum",
        "address": "Bangladesh National Museum, Shahbag, Dhaka",
        "background_image_url": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=60",
        "gallery_images": [
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1459749411177-2733399ecc52?w=800&auto=format&fit=crop&q=60"
        ],
        "status": "published",
        "capacity": 500,
        "timezone": "UTC+6",
        "created_by": user_id,
        "creator_name": user_name,
        "created_at": datetime.utcnow(),
        "target_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "category": "Music",
        "location_type": "physical",
        "guests": []
    }

    result = db.events.insert_one(dummy_event)
    print(f"Successfully seeded event with ID: {result.inserted_id}")

except Exception as e:
    print(f"Error seeding event: {e}")
