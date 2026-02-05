from src.database import mongo
from flask import Flask
from src.config import Config
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

TARGETS = ["Ink", "Scientifica", "Melody"]

with app.app_context():
    for target in TARGETS:
        print(f"\n--- Searching for '{target}' ---")
        event = mongo.db.events.find_one({"title": {"$regex": target, "$options": "i"}})
        if event:
            # Print specific image related fields
            print(f"Title: {event.get('title')}")
            print(f"background_image_url: {event.get('background_image_url')}")
            print(f"cover_image: {event.get('cover_image')}")
            print(f"gallery_images: {event.get('gallery_images')}")
            print(f"image: {event.get('image')}") # Check for potential other fields
        else:
            print("Not found.")
