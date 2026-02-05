from src.database import mongo
from flask import Flask
from src.config import Config

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    # Update the robotics event
    result = mongo.db.events.update_one(
        {"title": {"$regex": "Robotics"}},
        {"$set": {
            "background_image_url": "uploads/events/robotics_placeholder.jpg",
            "cover_image": "uploads/events/robotics_placeholder.jpg"
        }}
    )
    print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
