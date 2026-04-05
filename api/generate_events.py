
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

def generate_events():
    uri = os.getenv('MONGODB_URI')
    client = MongoClient(uri)
    db = client.get_database()
    
    user_id = ObjectId("6980e83e1f8033e2a8621bc8")
    user_name = "Tashin Khan"
    
    events = [
        {
            "title": "Tech Innovation Summit 2026",
            "description": "A gathering of technology leaders and innovators to discuss future trends in AI, robotics, and cloud computing.",
            "date": (datetime.utcnow() + timedelta(days=30)).strftime("%B %d, %Y"),
            "time": "10:00 AM",
            "start_date": (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "start_time": "10:00",
            "end_date": (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d"),
            "end_time": "17:00",
            "location": "Innovation Hub, Dhaka",
            "address": "Level 4, BDBL Bhaban, Karwan Bazar, Dhaka",
            "background_image_url": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=60",
            "gallery_images": [
                "https://images.unsplash.com/photo-1475721027785-f74dea327912?w=800&auto=format&fit=crop&q=60",
                "https://images.unsplash.com/photo-1511578319449-6239c305e037?w=800&auto=format&fit=crop&q=60"
            ],
            "status": "published",
            "is_featured": True,
            "capacity": 200,
            "timezone": "UTC+6",
            "created_by": user_id,
            "creator_name": user_name,
            "created_at": datetime.utcnow(),
            "target_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "category": "Tech",
            "location_type": "physical",
            "guests": [],
            "price": 10.0
        },
        {
            "title": "Summer Music Festival",
            "description": "Experience the best of local and international artists in a day of music, food, and community celebration.",
            "date": (datetime.utcnow() + timedelta(days=45)).strftime("%B %d, %Y"),
            "time": "4:00 PM",
            "start_date": (datetime.utcnow() + timedelta(days=45)).strftime("%Y-%m-%d"),
            "start_time": "16:00",
            "end_date": (datetime.utcnow() + timedelta(days=45)).strftime("%Y-%m-%d"),
            "end_time": "22:00",
            "location": "Hatirjheel Open Stage, Dhaka",
            "address": "Hatirjheel, Dhaka",
            "background_image_url": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60",
            "gallery_images": [
                "https://images.unsplash.com/photo-1459749411177-2733399ecc52?w=800&auto=format&fit=crop&q=60",
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60"
            ],
            "status": "published",
            "is_featured": True,
            "capacity": 1000,
            "timezone": "UTC+6",
            "created_by": user_id,
            "creator_name": user_name,
            "created_at": datetime.utcnow(),
            "target_date": (datetime.utcnow() + timedelta(days=45)).isoformat(),
            "category": "Music",
            "location_type": "physical",
            "guests": [],
            "price": 5.0
        },
        {
            "title": "Startup Pitch Night",
            "description": "Watch the city's brightest startups pitch their ideas to a panel of expert investors and mentors.",
            "date": (datetime.utcnow() + timedelta(days=15)).strftime("%B %d, %Y"),
            "time": "6:30 PM",
            "start_date": (datetime.utcnow() + timedelta(days=15)).strftime("%Y-%m-%d"),
            "start_time": "18:30",
            "end_date": (datetime.utcnow() + timedelta(days=15)).strftime("%Y-%m-%d"),
            "end_time": "21:00",
            "location": "GP House, Bashundhara",
            "address": "Bashundhara Residential Area, Dhaka",
            "background_image_url": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=60",
            "gallery_images": [],
            "status": "published",
            "is_featured": False,
            "capacity": 150,
            "timezone": "UTC+6",
            "created_by": user_id,
            "creator_name": user_name,
            "created_at": datetime.utcnow(),
            "target_date": (datetime.utcnow() + timedelta(days=15)).isoformat(),
            "category": "Business",
            "location_type": "physical",
            "guests": [],
            "price": 0.0
        },
        {
            "title": "Creative Art Workshop",
            "description": "Learn new techniques in painting and digital illustration from professional artists in a hands-on environment.",
            "date": (datetime.utcnow() + timedelta(days=20)).strftime("%B %d, %Y"),
            "time": "11:00 AM",
            "start_date": (datetime.utcnow() + timedelta(days=20)).strftime("%Y-%m-%d"),
            "start_time": "11:00",
            "end_date": (datetime.utcnow() + timedelta(days=20)).strftime("%Y-%m-%d"),
            "end_time": "14:00",
            "location": "DrikPath Gallery, Dhanmondi",
            "address": "Dhanmondi 27, Dhaka",
            "background_image_url": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60",
            "gallery_images": [
                "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&auto=format&fit=crop&q=60"
            ],
            "status": "published",
            "is_featured": False,
            "capacity": 30,
            "timezone": "UTC+6",
            "created_by": user_id,
            "creator_name": user_name,
            "created_at": datetime.utcnow(),
            "target_date": (datetime.utcnow() + timedelta(days=20)).isoformat(),
            "category": "Art",
            "location_type": "physical",
            "guests": [],
            "price": 15.0
        },
        {
            "title": "Community Yoga and Wellness",
            "description": "Start your weekend with a refreshing yoga session and wellness talk designed for all levels.",
            "date": (datetime.utcnow() + timedelta(days=10)).strftime("%B %d, %Y"),
            "time": "7:30 AM",
            "start_date": (datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%d"),
            "start_time": "07:30",
            "end_date": (datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%d"),
            "end_time": "09:00",
            "location": "Ramna Park, Dhaka",
            "address": "Shahbag, Dhaka",
            "background_image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=60",
            "gallery_images": [],
            "status": "published",
            "is_featured": True,
            "capacity": 100,
            "timezone": "UTC+6",
            "created_by": user_id,
            "creator_name": user_name,
            "created_at": datetime.utcnow(),
            "target_date": (datetime.utcnow() + timedelta(days=10)).isoformat(),
            "category": "Wellness",
            "location_type": "physical",
            "guests": [],
            "price": 0.0
        }
    ]
    
    result = db.events.insert_many(events)
    print(f"Successfully seeded {len(result.inserted_ids)} events for {user_name}.")

if __name__ == "__main__":
    generate_events()
