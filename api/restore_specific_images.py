from src.database import mongo
from flask import Flask
from src.config import Config

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

# Mapping based on best guess from file list and user context
# User said "Meldo Nights" (Melody Nights) had an image.
# "Scientifica" 
# "Biznix"
# "Creativa"

RESTORATION_MAP = {
    "Melody": "uploads/events/file_000000005f487206b7c4b48cb9f5e0c0_538437c4.webp",
    "Scientifica": "uploads/events/1769276987187_1_d52f27f7.webp", # Likely this one or "lingan"
    "Biznix": "uploads/events/Group_13_4326b9a1.webp",
    "Creativa": "uploads/events/EVENTIMAGE_36f4a3b2.webp",
    "Pitch Night": "uploads/events/1769276513898_05918f15.webp",
    "Marathon": "uploads/events/Yellow_Blue_Bold_Illustrative_Marathon_Event_Landscape_Banner_20260125_000508_0000_dba4dbae.webp"
}

with app.app_context():
    for key, image_path in RESTORATION_MAP.items():
        print(f"Restoring image for '{key}' -> {image_path}")
        result = mongo.db.events.update_one(
            {"title": {"$regex": key, "$options": "i"}},
            {"$set": {
                "background_image_url": image_path,
                "cover_image": image_path
            }}
        )
        print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
