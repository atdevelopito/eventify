from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv('MONGODB_URI')
if not mongo_uri:
    print("No MONGODB_URI found")
    exit(1)

client = MongoClient(mongo_uri)
try:
    db = client.get_database()
except:
    db = client.eventify

events = list(db.events.find())
print(f'Total events in database: {len(events)}')

if events:
    print('Events found:')
    for e in events:
        print(f"  - Title: {e.get('title')}")
        print(f"    Status: {e.get('status', 'MISSING')}")
        print(f"    Target Date: {e.get('target_date', 'MISSING')}")
        print(f"    Created By: {e.get('created_by', 'MISSING')}")
        print(f"    ID: {e.get('_id')}")
        print("-" * 20)
else:
    print('No events found in database.')

