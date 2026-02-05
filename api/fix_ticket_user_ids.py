"""
Fix user_id field in tickets to match the format expected by the endpoint
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

print("🔧 Fixing ticket user_id fields...\n")

# Get all tickets
tickets = list(db.tickets.find())
print(f"Found {len(tickets)} tickets\n")

fixed_count = 0

for ticket in tickets:
    user_id = ticket.get('user_id')
    
    if user_id:
        # Try to find user by _id (ObjectId)
        try:
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                # User found, ticket is correct
                print(f"✅ Ticket {ticket.get('ticket_id')} - user_id is correct")
                continue
        except:
            pass
        
        # Try to find user by 'id' field (string)
        user = db.users.find_one({"id": user_id})
        if user:
            # Found user, update ticket to use _id
            correct_user_id = str(user['_id'])
            db.tickets.update_one(
                {"_id": ticket['_id']},
                {"$set": {"user_id": correct_user_id}}
            )
            print(f"🔧 Fixed ticket {ticket.get('ticket_id')} - updated user_id from '{user_id}' to '{correct_user_id}'")
            fixed_count += 1
        else:
            print(f"⚠️  Ticket {ticket.get('ticket_id')} - could not find user for user_id: {user_id}")

print(f"\n✅ Fixed {fixed_count} tickets")
print("Done!")
