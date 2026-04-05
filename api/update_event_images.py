
import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

def update_images():
    uri = os.getenv('MONGODB_URI')
    client = MongoClient(uri)
    db = client.get_database()
    
    updates = [
        {
            "id": "6984d0c23f5dd282e67a8ce4", # Scientifica
            "img": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=80"
        },
        {
            "id": "69d1c26d3674a54dfd7cc475", # Global Tech Summit 2026
            "img": "https://images.unsplash.com/photo-1540575861501-7ad0582373f2?w=1200&auto=format&fit=crop&q=80"
        },
        {
            "id": "69d1c26d3674a54dfd7cc476", # Midnight Jazz & Blues Festival
            "img": "https://images.unsplash.com/photo-1514525253361-bee8d48700df?w=1200&auto=format&fit=crop&q=80"
        }
    ]
    
    for item in updates:
        # Update both field names just in case frontend uses one or the other
        db.events.update_one(
            {"_id": ObjectId(item["id"])},
            {"$set": {
                "background_image_url": item["img"],
                "banner_url": item["img"]
            }}
        )
        print(f"Updated images for ID: {item['id']}")

if __name__ == "__main__":
    update_images()
