
from src.database import mongo
from src.config import Config
from flask import Flask
from bson.objectid import ObjectId

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("--- Analyzing Registrations ---")
    all_regs = list(mongo.db.registrations.find())
    print(f"Total Registrations: {len(all_regs)}")
    
    orphaned_count = 0
    missing_fields_count = 0
    valid_count = 0
    
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
            orphaned_count += 1
            # print(f"Orphaned Registration ID: {reg['_id']} (Event ID: {event_id})")
        else:
            # Check for critical fields
            title = event.get('title')
            date = event.get('date') or event.get('start_date')
            image = event.get('background_image_url') or event.get('cover_image')
            
            if not title or not date:
                missing_fields_count += 1
                # print(f"Incomplete Event Data for Registration {reg['_id']} (Event: {title})")
            else:
                valid_count += 1
                
    print(f"\nSummary:")
    print(f"Valid Registrations: {valid_count}")
    print(f"Orphaned (Event Deleted): {orphaned_count}")
    print(f"Incomplete Event Data: {missing_fields_count}")
