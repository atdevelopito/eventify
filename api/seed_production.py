"""
Production-level database seeder for Eventify.
Creates dummy events, members, and categories to populate the frontend.
"""
import sys
import os
from datetime import datetime, timedelta
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.database import mongo
from app import app
from bson.objectid import ObjectId

def seed_data():
    print("[INIT] Seeding Eventify Database...")
    
    with app.app_context():
        # 1. CLEANUP (Optional - use with caution)
        # mongo.db.events.delete_many({}) # Uncomment to wipe and reset
        
        # 2. CREATE A DUMMY ORGANIZER (if not exists)
        organizer = mongo.db.users.find_one({"role": "organizer"})
        if not organizer:
            print("Creating dummy organizer...")
            user_id = mongo.db.users.insert_one({
                "name": "Eventify Teams",
                "email": "teams@eventify.fun",
                "role": "organizer",
                "is_verified": True,
                "is_organizer": True,
                "password": "hashed_password_here" 
            }).inserted_id
        else:
            user_id = organizer['_id']

        # 3. CREATE FEATURED EVENTS
        featured_events = [
            {
                "title": "Global Tech Summit 2026",
                "category": "Tech",
                "description": "Join 10,000+ developers for the largest AI and Cloud conference of the year.",
                "target_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
                "status": "published",
                "is_featured": True,
                "created_by": user_id,
                "banner_url": "https://images.unsplash.com/photo-1540575861501-7ad0582373f2?auto=format&fit=crop&q=80&w=1200",
                "price": 299.0,
                "capacity": 500,
                "current_registrations": 0,
                "created_at": datetime.utcnow()
            },
            {
                "title": "Midnight Jazz & Blues Festival",
                "category": "Music",
                "description": "An intimate evening with the world's best soul and jazz performers under the stars.",
                "target_date": (datetime.utcnow() + timedelta(days=15)).isoformat(),
                "status": "published",
                "is_featured": True,
                "created_by": user_id,
                "banner_url": "https://images.unsplash.com/photo-1514525253361-bee8d48700df?auto=format&fit=crop&q=80&w=1200",
                "price": 45.0,
                "capacity": 1500,
                "current_registrations": 0,
                "created_at": datetime.utcnow()
            }
        ]

        # Bulk insert featured events if none exist or to add more
        for event in featured_events:
            # Check if title exists to avoid duplicates
            if not mongo.db.events.find_one({"title": event['title']}):
                mongo.db.events.insert_one(event)
                print(f"OK: Created event: {event['title']}")

    print("\nDONE: Seeding Complete! Refresh the Discover page to see the events.")

if __name__ == "__main__":
    seed_data()
