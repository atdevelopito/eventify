
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def find_events():
    uri = os.getenv('MONGODB_URI')
    client = MongoClient(uri)
    db = client.get_database()
    
    titles = ["Scientifica", "Midnight Jazz & Blues Festival", "Global Tech Summit 2026"]
    results = db.events.find({"title": {"$in": titles}})
    
    for event in results:
        print(f"ID: {event['_id']}, Title: {event['title']}")

if __name__ == "__main__":
    find_events()
