from pymongo import MongoClient
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ.get('MONGODB_URI', 'mongodb://localhost:27017'))
db = client.get_database() if client.get_database().name != 'admin' else client.eventify

pwd = bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode('utf-8')
db.users.update_one(
    {"email": "org@test.com"},
    {"$set": {"name": "Org", "email": "org@test.com", "password": pwd, "role": "organizer", "is_verified": True}},
    upsert=True
)
print("Done")
