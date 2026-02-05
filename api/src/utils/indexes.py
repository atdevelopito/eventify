
from datetime import datetime
from src.database import mongo
import pymongo

def create_indexes():
    # User indexes
    mongo.db.users.create_index("email", unique=True)
    mongo.db.users.create_index("verification_token", unique=True, sparse=True)
    
    # TTL Index for unverified users (7 days)
    # Using 'verification_expires_at' which is set 7 days in future.
    # expireAfterSeconds=0 means it expires at the specific time in the field.
    mongo.db.users.create_index("verification_expires_at", expireAfterSeconds=0)

    # Password Reset indexes
    mongo.db.password_resets.create_index("token", unique=True)
    # TTL for password resets
    mongo.db.password_resets.create_index("expires_at", expireAfterSeconds=0)
    
    print("Indexes created successfully.")
