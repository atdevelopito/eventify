from src.database import mongo
from src.config import Config
from flask import Flask

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("Checking for duplicate registrations...")
    
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
    
    if not duplicates:
        print("No duplicate registrations found.")
    else:
        print(f"Found {len(duplicates)} sets of duplicate registrations:")
        for dup in duplicates:
            print(f"User: {dup['_id']['user_id']} | Event: {dup['_id']['event_id']} | Count: {dup['count']}")
            print(f"  IDs: {dup['reg_ids']}")
