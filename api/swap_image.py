from src.database import mongo
from flask import Flask
from src.config import Config

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

# Ink's working image: uploads/events/file_000000005f487206b7c4b48cb9f5e0c0_1b2c1a83.webp
WORKING_IMAGE = "uploads/events/file_000000005f487206b7c4b48cb9f5e0c0_1b2c1a83.webp"

with app.app_context():
    # Set Scientifica to use Ink's image
    result = mongo.db.events.update_one(
        {"title": {"$regex": "Scientifica"}},
        {"$set": {"background_image_url": WORKING_IMAGE}}
    )
    print(f"Swapped Scientifica image: {result.modified_count}")
