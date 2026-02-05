from src.database import mongo
from flask import Flask
from src.config import Config
import random
import os

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

VALID_IMAGES = [
    "uploads/events/1769273750017_667970f0.webp",
    "uploads/events/1769276513898_05918f15.webp",
    "uploads/events/1769276987187_1_d52f27f7.webp",
    "uploads/events/1769278756038_00a1f368.webp",
    "uploads/events/EVENTIMAGE_36f4a3b2.webp",
    "uploads/events/EVENTIMAGE_fc4c1dd3.webp",
    "uploads/events/Group_13_4326b9a1.webp",
    "uploads/events/IMG_20240923_231321_937_0be4bf72.webp",
    "uploads/events/Yellow_Blue_Bold_Illustrative_Marathon_Event_Landscape_Banner_20260125_000508_0000_dba4dbae.webp",
    "uploads/events/image_63e8b28c.webp",
    "uploads/events/lingan_077581e4.webp"
]

with app.app_context():
    # Find events with missing images
    events = mongo.db.events.find({
        "$or": [
            {"background_image_url": {"$exists": False}},
            {"background_image_url": ""},
            {"background_image_url": None},
            {"background_image_url": "None"}
        ]
    })
    
    count = 0
    for event in events:
        # Pick a random image
        random_image = random.choice(VALID_IMAGES)
        
        mongo.db.events.update_one(
            {"_id": event["_id"]},
            {"$set": {"background_image_url": random_image}}
        )
        print(f"Updated '{event.get('title')}' with {random_image}")
        count += 1
        
    print(f"Total events updated: {count}")
