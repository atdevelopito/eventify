from src.database import mongo
from flask import Flask
from src.config import Config
import time

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    # Update the robotics event with a cache-busting query param
    timestamp = int(time.time())
    new_path = f"uploads/events/robotics_placeholder.jpg?v={timestamp}"
    
    result = mongo.db.events.update_one(
        {"title": {"$regex": "Robotics"}},
        {"$set": {
            "background_image_url": new_path,
            "cover_image": new_path
        }}
    )
    print(f"Updated event image to: {new_path}")
    print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
