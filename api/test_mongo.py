from pymongo import MongoClient
import os
import sys

print(f"Python: {sys.executable}")
try:
    client = MongoClient("mongodb://localhost:27017/eventify")
    print("Client created")
    db = client.eventify
    print("DB accessed")
    print(f"Collections: {db.list_collection_names()}")
except Exception as e:
    print(f"Error: {e}")
