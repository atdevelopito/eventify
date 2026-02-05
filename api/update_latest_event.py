from src.database import mongo
from src.config import Config
from flask import Flask
from bson.objectid import ObjectId
from datetime import datetime, timedelta

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    # Find most recent registration
    last_reg = mongo.db.registrations.find_one(sort=[('_id', -1)])
    
    if not last_reg:
        print("No registrations found.")
        exit(1)
        
    event_id = last_reg.get('event_id')
    print(f"Latest Registration ID: {last_reg['_id']}")
    print(f"Event ID: {event_id}")
    
    # Calculate tomorrow's date
    tomorrow = datetime.now() + timedelta(days=1)
    tomorrow_str = tomorrow.strftime('%Y-%m-%d')
    tomorrow_iso = tomorrow.isoformat()
    
    # Update event
    # Try ObjectId then string
    query = {}
    try:
        query = {"_id": ObjectId(event_id)}
    except:
        query = {"_id": str(event_id)}
        
    result = mongo.db.events.update_one(
        query,
        {
            "$set": {
                "target_date": tomorrow_iso,
                "date": tomorrow_str,
                "start_date": tomorrow_iso,
                "title": "UPDATED: The Magic At (Future Date)"
            }
        }
    )
    
    if result.modified_count > 0:
        print(f"Successfully updated event date to {tomorrow_str}")
    else:
        print("Failed to update event (not found or no change).")
