from app import app
from src.database import mongo
from bson.objectid import ObjectId

with app.app_context():
    # Check registrations collection
    print("=== Checking Registrations ===")
    registrations = list(mongo.db.registrations.find().limit(5))
    print(f"Total registrations: {mongo.db.registrations.count_documents({})}")
    if registrations:
        print(f"\nSample registration: {registrations[0]}")
        
        # Check if event exists
        if 'event_id' in registrations[0]:
            event_id = registrations[0]['event_id']
            print(f"\nLooking for event with ID: {event_id} (type: {type(event_id)})")
            
            # Try as ObjectId
            try:
                event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
                if event:
                    print(f"Found event: {event.get('title')}")
                    print(f"Event has cover_image: {'cover_image' in event}")
                    print(f"Event has background_image_url: {'background_image_url' in event}")
                    if 'cover_image' in event:
                        print(f"cover_image value: {event.get('cover_image')}")
                else:
                    print("Event not found as ObjectId")
            except Exception as e:
                print(f"Error looking up as ObjectId: {e}")
    else:
        print("No registrations found")
