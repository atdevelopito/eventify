from pymongo import MongoClient
import certifi

MONGO_URI = "mongodb+srv://eventifyfun_db_user:N6KZvC9HtVts4THX@cluster0.6pzu20r.mongodb.net/eventify?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client['eventify']

# Check total events
total = db.events.count_documents({})
print(f"Total events in DB: {total}")

# Check how many are published
published = db.events.count_documents({"status": "published"})
print(f"Published events: {published}")

# Check how many are already featured
featured = db.events.count_documents({"is_featured": True})
print(f"Already featured: {featured}")

# Mark all published events as featured
if published > 0:
    result = db.events.update_many(
        {"status": "published"},
        {"$set": {"is_featured": True}}
    )
    print(f"Marked {result.modified_count} published events as featured")
else:
    # If none are published, publish and feature all events
    result = db.events.update_many(
        {},
        {"$set": {"is_featured": True, "status": "published"}}
    )
    print(f"Marked {result.modified_count} events as published + featured")

print("Done!")
