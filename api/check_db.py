import os
os.environ['FLASK_APP'] = 'app.py'

from app import app
from src.database import mongo
from bson.objectid import ObjectId

with app.app_context():
    print("=== Database Check ===")
    
    # Check if database is connected
    try:
        db_name = mongo.db.name
        print(f"Connected to database: {db_name}")
    except Exception as e:
        print(f"Database connection error: {e}")
        exit(1)
    
    # Count registrations
    reg_count = mongo.db.registrations.count_documents({})
    print(f"\nTotal registrations: {reg_count}")
    
    if reg_count > 0:
        # Get a sample registration
        sample = mongo.db.registrations.find_one()
        print(f"\nSample registration:")
        print(f"  ID: {sample.get('_id')}")
        print(f"  User ID: {sample.get('user_id')}")
        print(f"  Event ID: {sample.get('event_id')}")
        print(f"  Event ID type: {type(sample.get('event_id'))}")
        
        # Try to find the event
        event_id = sample.get('event_id')
        if event_id:
            try:
                event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
                if event:
                    print(f"\n✓ Event found: {event.get('title')}")
                    print(f"  Has cover_image: {bool(event.get('cover_image'))}")
                else:
                    print(f"\n✗ Event NOT found with ID: {event_id}")
            except Exception as e:
                print(f"\n✗ Error finding event: {e}")
    else:
        print("\n⚠ No registrations in database")
        print("This is why My Tickets page shows 'No upcoming events'")
