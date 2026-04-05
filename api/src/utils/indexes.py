
from datetime import datetime
from src.database import mongo
import pymongo

def create_indexes():
    # User indexes
    mongo.db.users.create_index("email", unique=True)
    mongo.db.users.create_index("verification_token", unique=True, sparse=True)
    mongo.db.users.create_index("verification_expires_at", expireAfterSeconds=0)

    # Password Reset indexes
    mongo.db.password_resets.create_index("token", unique=True)
    mongo.db.password_resets.create_index("expires_at", expireAfterSeconds=0)

    # Event indexes (Public feed, owner feeds)
    mongo.db.events.create_index([("status", 1), ("is_featured", -1)])
    mongo.db.events.create_index("created_by")
    
    # Registration & Ticket indexes (User profile, validation)
    mongo.db.registrations.create_index("user_id")
    mongo.db.registrations.create_index("event_id")
    mongo.db.tickets.create_index("user_id")
    mongo.db.tickets.create_index("event_id")
    mongo.db.tickets.create_index("registration_id")
    mongo.db.tickets.create_index("ticket_id", unique=True)
    mongo.db.tickets.create_index("status")
    
    print("Performance & TTL Indexes created successfully.")
