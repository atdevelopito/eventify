from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
dbs = client.list_database_names()
print(f"Databases found: {dbs}")

for db_name in dbs:
    if db_name in ['admin', 'local', 'config']: continue
    db = client[db_name]
    events_count = db.events.count_documents({})
    print(f"DB: {db_name} | Events: {events_count}")
    if events_count > 0:
        sample = db.events.find_one()
        print(f"  Sample Event: {sample.get('title')} | Status: {sample.get('status')} | Featured: {sample.get('is_featured')}")
