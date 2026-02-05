import os
import pymongo
from dotenv import load_dotenv
from datetime import datetime, timedelta
from bson import ObjectId

load_dotenv()

MONGO_URI = os.getenv('MONGODB_URI')
print(f"Connecting to: {MONGO_URI.split('@')[1] if '@' in MONGO_URI else 'LOCAL'}")

client = pymongo.MongoClient(MONGO_URI)
db = client.get_database('eventify')

# FORCE CLEAR for debugging
print("Clearing existing events...")
db.events.delete_many({})
print("Events cleared.")

print("Seeding database...")

# Create Dummy User for Creator
user_id = ObjectId()
db.users.update_one(
    {"email": "admin@eventify.fun"},
    {"$set": {
        "name": "Eventify Admin",
        "email": "admin@eventify.fun",
        "role": "admin",
        "password_hash": "seeded_hash"
    }},
    upsert=True
)
admin_user = db.users.find_one({"email": "admin@eventify.fun"})
user_id = admin_user['_id']

events = [
    {
        "title": "Future of Robotics Summit",
        "description": "Join leading experts to discuss the next generation of humanoid robots and AI integration.",
        "date": "2024-12-15",
        "time": "09:00",
        "start_date": "2024-12-15",
        "start_time": "09:00",
        "end_date": "2024-12-15",
        "end_time": "18:00",
        "location": "Moscone Center, SF",
        "address": "747 Howard St, San Francisco, CA 94103",
        "category": "Tech",
        "is_featured": True,
        "status": "published",
        "created_by": user_id,
        "created_at": datetime.utcnow(),
        "target_date": datetime.utcnow() + timedelta(days=30),
        "background_image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
        "capacity": 500,
        "price": 299
    },
    {
        "title": "Neon City Music Festival",
        "description": "A 3-day electronic music experience featuring top global DJs and immersive light shows.",
        "date": "2024-11-20",
        "time": "18:00",
        "start_date": "2024-11-20",
        "start_time": "18:00",
        "end_date": "2024-11-23",
        "end_time": "02:00",
        "location": "Downtown Arena",
        "address": "123 Neon Ave, Miami, FL",
        "category": "Music",
        "is_featured": True,
        "status": "published",
        "created_by": user_id,
        "created_at": datetime.utcnow(),
        "target_date": datetime.utcnow() + timedelta(days=10),
        "background_image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1000",
        "capacity": 5000,
        "price": 150
    },
    {
        "title": "Global Culinary Expo",
        "description": "Taste dishes from over 50 countries and watch live cooking demonstrations by celebrity chefs.",
        "date": "2025-01-10",
        "time": "10:00",
        "start_date": "2025-01-10",
        "start_time": "10:00",
        "end_date": "2025-01-12",
        "end_time": "20:00",
        "location": "Grand Convention Hall",
        "address": "500 Culinary Blvd, Paris, France",
        "category": "Food & Drink",
        "is_featured": True,
        "status": "published",
        "created_by": user_id,
        "created_at": datetime.utcnow(),
        "target_date": datetime.utcnow() + timedelta(days=45),
        "background_image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000",
        "capacity": 2000,
        "price": 45
    }
]

db.events.insert_many(events)
print(f"Successfully inserted {len(events)} events!")
print("Done.")
