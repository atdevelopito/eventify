
from src.database import mongo
from src.config import Config
from flask import Flask
from bson.objectid import ObjectId

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("--- Cleaning Up Orphaned Registrations ---")
    all_regs = list(mongo.db.registrations.find())
    deleted_count = 0
    
    for reg in all_regs:
        event_id = reg.get('event_id')
        event = None
        
        # Try finding the event
        if event_id:
            try:
                event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
            except:
                pass
            if not event and isinstance(event_id, str):
                 event = mongo.db.events.find_one({"_id": event_id})
        
        if not event:
            print(f"Deleting Orphaned Registration: {reg['_id']} (Event {event_id} not found)")
            mongo.db.registrations.delete_one({"_id": reg['_id']})
            deleted_count += 1
            
    print(f"\nCleanup Complete.")
    print(f"Deleted {deleted_count} orphaned registrations.")
