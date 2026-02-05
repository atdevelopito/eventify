from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv('.env')
mongo = MongoClient(os.getenv('MONGODB_URI'))
db = mongo.get_database()

event = db.events.find_one({"title": {"$regex": "SCIENTIFICA"}})
import pprint
if event:
    pprint.pprint(event)
else:
    print("Event not found")
