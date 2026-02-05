from pymongo import MongoClient
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client.eventify
    
    # Remove existing 'Hello' or test events to start fresh
    db.events.delete_many({})
    print("Cleaned up old events.")

    events = [
        {
            "title": "Robotics Championship 2026",
            "description": "The ultimate battle of machines! Join the most prestigious robotics competition in the country.",
            "date": "March 20, 2026",
            "time": "10:00 AM",
            "start_date": "2026-03-20",
            "start_time": "10:00",
            "end_date": "2026-03-20",
            "end_time": "18:00",
            "location": "ICT Tower, Agargaon",
            "address": "ICT Tower, Agargaon, Dhaka",
            "background_image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
            "status": "published",
            "is_featured": True,
            "capacity": 200,
            "category": "Tech",
            "created_at": datetime.utcnow(),
            "target_date": "2026-03-20T10:00:00Z"
        },
        {
            "title": "Scientifica: Innovation Summit",
            "description": "Where science meets the future. Explore groundbreaking research and innovative technologies.",
            "date": "April 15, 2026",
            "time": "09:00 AM",
            "start_date": "2026-04-15",
            "start_time": "09:00",
            "end_date": "2026-04-16",
            "end_time": "17:00",
            "location": "Senate Bhaban, DU",
            "address": "Dhaka University Senate Bhaban",
            "background_image_url": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800",
            "status": "published",
            "is_featured": True,
            "capacity": 300,
            "category": "Tech",
            "created_at": datetime.utcnow(),
            "target_date": "2026-04-15T09:00:00Z"
        },
        {
            "title": "Dhaka Food Festival",
            "description": "A celebration of taste! Experience the best cuisines from across the city in one place.",
            "date": "May 05, 2026",
            "time": "12:00 PM",
            "start_date": "2026-05-05",
            "start_time": "12:00",
            "end_date": "2026-05-05",
            "end_time": "22:00",
            "location": "Purbachal 300 Feet",
            "address": "Purbachal, 300 Feet Road, Dhaka",
            "background_image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
            "status": "published",
            "is_featured": True,
            "capacity": 1000,
            "category": "Food & Drink",
            "created_at": datetime.utcnow(),
            "target_date": "2026-05-05T12:00:00Z"
        }
    ]

    result = db.events.insert_many(events)
    print(f"Successfully seeded {len(result.inserted_ids)} featured events.")

except Exception as e:
    print(f"Error seeding events: {e}")
