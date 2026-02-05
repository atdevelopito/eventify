from src.database import mongo
from app import app
from bson.objectid import ObjectId
import pprint

def inspect_events():
    with app.app_context():
        # Fetch all events
        events = list(mongo.db.events.find())
        
        output = []
        output.append(f"Found {len(events)} events.")
        output.append("-" * 40)
        
        for event in events:
            creator_id = event.get('created_by')
            created_at = event.get('created_at', 'Unknown Date')
            # Try to fetch creator email
            creator = mongo.db.users.find_one({"_id": ObjectId(creator_id)})
            creator_email = creator.get('email') if creator else "Unknown User"
            
            output.append(f"Title: {event.get('title', 'NO TITLE')}")
            output.append(f"ID: {event.get('_id')}")
            output.append(f"Created By: {creator_email} (ID: {creator_id})")
            output.append(f"Created At: {created_at}")
            output.append(f"Image: {event.get('cover_image')}")
            output.append("-" * 20)
        
        with open("debug_output.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(output))
        print("Done writing to debug_output.txt")

if __name__ == "__main__":
    inspect_events()
