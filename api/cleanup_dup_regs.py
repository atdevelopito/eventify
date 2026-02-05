from src.database import mongo
from src.config import Config
from flask import Flask

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("Starting duplicate registration cleanup...")
    
    # Group by user_id and event_id
    pipeline = [
        {
            "$group": {
                "_id": {
                    "user_id": "$user_id",
                    "event_id": "$event_id"
                },
                "count": {"$sum": 1},
                "reg_ids": {"$push": {"$toString": "$_id"}}
            }
        },
        {
            "$match": {
                "count": {"$gt": 1}
            }
        }
    ]
    
    duplicates = list(mongo.db.registrations.aggregate(pipeline))
    
    total_regs_deleted = 0
    total_tickets_deleted = 0
    
    for group in duplicates:
        user_id = group['_id']['user_id']
        event_id = group['_id']['event_id']
        reg_ids = group['reg_ids']
        
        # Sort IDs to keep the oldest (MongoDB ObjectId starts with timestamp)
        reg_ids.sort()
        
        # Keep the first one, delete the rest
        keep_id = reg_ids[0]
        delete_ids = reg_ids[1:]
        
        print(f"User {user_id} on Event {event_id}: Keeping {keep_id}, Deleting {delete_ids}")
        
        for r_id in delete_ids:
            # Delete registration
            from bson.objectid import ObjectId
            mongo.db.registrations.delete_one({"_id": ObjectId(r_id)})
            total_regs_deleted += 1
            
            # Delete associated tickets
            res = mongo.db.tickets.delete_many({"registration_id": r_id})
            deleted_tickets = res.deleted_count
            total_tickets_deleted += deleted_tickets
            
            print(f"  - Deleted Registration {r_id} and {deleted_tickets} associated tickets.")
            
    print(f"Cleanup complete. Deleted {total_regs_deleted} registrations and {total_tickets_deleted} tickets.")
