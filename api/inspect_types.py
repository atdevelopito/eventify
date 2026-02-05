from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client.eventify
event = db.events.find_one({"title": {"$regex": "Robotics"}})

if event:
    print(f"Title: {event.get('title')}")
    print(f"Status (Type: {type(event.get('status'))}): {event.get('status')}")
    print(f"Is Featured (Type: {type(event.get('is_featured'))}): {event.get('is_featured')}")
else:
    print("Event not found")
