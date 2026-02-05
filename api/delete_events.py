import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv('.env')

# Connect to MongoDB
mongo_uri = os.getenv('MONGODB_URI')
if not mongo_uri:
    print("❌ Error: MONGODB_URI not found in .env")
    exit(1)

try:
    client = MongoClient(mongo_uri)
    try:
        db = client.get_database()
    except:
        db = client['eventify']
        
    print(f"Connected to database: {db.name}")

    # Delete all events
    result = db.events.delete_many({})
    print(f"✅ Success! Deleted {result.deleted_count} events.")

except Exception as e:
    print(f"❌ An error occurred: {e}")
