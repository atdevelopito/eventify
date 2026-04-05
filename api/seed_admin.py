from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ.get('MONGODB_URI', 'mongodb://localhost:27017'))
db = client.eventify  # explicitly targeting eventify database assuming fallback

pwd = bcrypt.hashpw(b'admin', bcrypt.gensalt()).decode('utf-8')
db.users.update_one(
    {"email": "admin@example.com"},
    {"$set": {
        "name": "Admin Test", 
        "email": "admin@example.com", 
        "password": pwd, 
        "role": "admin", 
        "is_verified": True
    }},
    upsert=True
)
print("Admin user seeded successfully!")
