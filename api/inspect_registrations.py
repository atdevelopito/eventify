
from src.database import mongo
from src.config import Config
from flask import Flask
import pprint

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("Checking registrations and linked events...")
    regs = list(mongo.db.registrations.find())
    for reg in regs:
        print(f"\nRegistration: {reg['_id']}")
        event_id = reg.get('event_id')
        print(f"Event ID: {event_id}")
        
        event = None
        from bson.objectid import ObjectId
        try:
             event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        except:
             if isinstance(event_id, str):
                 event = mongo.db.events.find_one({"_id": event_id})
        
        if event:
            print(f"Event Title: {event.get('title')}")
            print(f"Event Image: {event.get('background_image_url')}")
            print(f"Event Cover: {event.get('cover_image')}")
        else:
            print("Event NOT FOUND")
