import sys
import os

# Add 'api' folder to python path so we can import src
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from flask import Flask
from src.database import mongo
from src.config import Config
from datetime import datetime, timedelta
import random
from bson.objectid import ObjectId

app = Flask(__name__)
app.config.from_object(Config)

mongo.init_app(app)

TARGET_EMAIL = "attashinorg@gmail.com"

def seed():
    with app.app_context():
        print(f"Seeding transactions for specific organizer: {TARGET_EMAIL}...")
        
        # 1. Find the Organizer User
        organizer = mongo.db.users.find_one({"email": TARGET_EMAIL})
        if not organizer:
            print(f"User {TARGET_EMAIL} not found. Seeding to random events instead.")
            # Fallback to all events
            events = list(mongo.db.events.find())
        else:
            print(f"Found Organizer ID: {organizer['_id']}")
            # 2. Find Events created by this Organizer
            # Try string and ObjectId
            events = list(mongo.db.events.find({
                "$or": [
                    {"created_by": organizer['_id']},
                    {"created_by": str(organizer['_id'])}
                ]
            }))
            
        if not events:
            print(f"No events found for {TARGET_EMAIL}. Creating a dummy event...")
            # Create a dummy event for them so they see something
            if organizer:
                dummy_event = {
                    "title": "Grand Launch Party (Demo)",
                    "description": "Auto-generated demo event",
                    "date": datetime.utcnow() + timedelta(days=30),
                    "location": "Dhaka, Bangladesh",
                    "created_by": organizer['_id'],
                    "capacity": 100,
                    "price": 500,
                    "tickets": [
                        {"name": "VIP", "price": 1000, "quantity": 50},
                        {"name": "General", "price": 500, "quantity": 50}
                    ],
                    "status": "published"
                }
                res = mongo.db.events.insert_one(dummy_event)
                dummy_event["_id"] = res.inserted_id
                events = [dummy_event]
            else:
                 print("Cannot create event without organizer.")
                 return

        print(f"Found {len(events)} target events. Injecting sales...")

        # 3. Get or Create Fake Buyers
        fake_users = [
            {"name": "Rahim Ahmed", "email": "rahim@example.com"},
            {"name": "Karim Upl", "email": "karim@example.com"},
            {"name": "Sarah Khan", "email": "sarah@test.com"},
            {"name": "John Doe", "email": "john@doe.com"},
            {"name": "Tanvir Hasan", "email": "tanvir@dev.com"},
            {"name": "Nadia Islam", "email": "nadia@test.com"}
        ]
        
        user_ids = []
        for u in fake_users:
            existing = mongo.db.users.find_one({"email": u["email"]})
            if existing:
                user_ids.append(existing["_id"])
            else:
                res = mongo.db.users.insert_one({
                    "name": u["name"], 
                    "email": u["email"], 
                    "role": "user",
                    "created_at": datetime.utcnow()
                })
                user_ids.append(res.inserted_id)

        # 4. Create Registrations
        payment_methods = ['BKash', 'Nagad', 'Card', 'Rocket']
        ticket_types = ['General', 'VIP']
        
        registrations = []
        for _ in range(20): # 20 sales
            event = random.choice(events)
            user_id = random.choice(user_ids)
            price = random.choice([500, 1000, 2500])
            qty = random.randint(1, 4)
            
            reg = {
                "user_id": user_id,
                "event_id": str(event["_id"]),
                "ticket_type": random.choice(ticket_types),
                "price": price,
                "quantity": qty,
                "payment_method": random.choice(payment_methods),
                "status": "confirmed",
                "payment_status": "paid",
                "registered_at": datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            }
            registrations.append(reg)
            
        if registrations:
            mongo.db.registrations.insert_many(registrations)
            print(f"Successfully seeded {len(registrations)} transactions for user {TARGET_EMAIL}!")
        
if __name__ == '__main__':
    seed()
