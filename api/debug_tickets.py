"""
Debug script to check ticket data structure
"""
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongo_uri)
db = client['eventify']

print("🔍 Checking recent tickets...\n")

# Get the most recent ticket
tickets = list(db.tickets.find().sort('created_at', -1).limit(3))

for ticket in tickets:
    print(f"Ticket ID: {ticket.get('_id')}")
    print(f"  ticket_id: {ticket.get('ticket_id')}")
    print(f"  user_id: {ticket.get('user_id')}")
    print(f"  qr_token: {ticket.get('qr_token')}")
    print(f"  status: {ticket.get('status')}")
    print(f"  event_id: {ticket.get('event_id')}")
    
    # Check if user exists
    user_id = ticket.get('user_id')
    if user_id:
        try:
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                print(f"  ✅ User found: {user.get('name')} ({user.get('email')})")
            else:
                print(f"  ❌ User NOT found with _id: {user_id}")
                # Try finding by string ID
                user = db.users.find_one({"id": user_id})
                if user:
                    print(f"  ✅ User found with 'id' field: {user.get('name')}")
        except Exception as e:
            print(f"  ❌ Error looking up user: {e}")
    
    print()

print("\n🔍 Checking users...")
users = list(db.users.find().limit(2))
for user in users:
    print(f"User _id: {user.get('_id')}")
    print(f"  id field: {user.get('id')}")
    print(f"  name: {user.get('name')}")
    print(f"  email: {user.get('email')}")
    print()
