from src.database import mongo
from flask import Flask
from src.config import Config

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    # Set Robotics event as featured
    result = mongo.db.events.update_one(
        {"title": {"$regex": "Robotics"}},
        {"$set": {"is_featured": True}}
    )
    print(f"Robotics Featured: {result.modified_count}")

    # Set another one just in case 
    result2 = mongo.db.events.update_one(
        {"title": {"$regex": "Scientifica"}},
        {"$set": {"is_featured": True}}
    )
    print(f"Scientifica Featured: {result2.modified_count}")
