
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

def find_user():
    uri = os.getenv('MONGODB_URI')
    client = MongoClient(uri)
    # The URI has the database in it 'cluster0.6pzu20r.mongodb.net/eventify'
    # but we can also specify it just in case.
    db = client.get_database()
    user = db.users.find_one({'email': 'tashinkan360@gmail.com'})
    if user:
        print(f"ID: {user['_id']}")
        print(f"Role: {user.get('role')}")
        print(f"Name: {user.get('name')}")
    else:
        print("NOT_FOUND")

if __name__ == "__main__":
    find_user()
