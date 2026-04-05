import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from src.database import mongo
from app import app

def add_tickets():
    with app.app_context():
        tickets = [
            {
                "id": "t1",
                "name": "General Admission",
                "price": 0,
                "description": "Access to all keynotes and expo hall.",
                "is_free": True,
                "category": "General",
                "metadata": {
                    "attributes": [{"label": "Entry", "value": "Standard Access"}]
                }
            },
            {
                "id": "t2",
                "name": "VIP Pass",
                "price": 1500,
                "description": "Front row seating, dedicated networking sessions.",
                "is_free": False,
                "category": "VIP",
                "metadata": {
                    "attributes": [{"label": "Entry", "value": "Priority Access"}]
                }
            }
        ]
        
        # Add tickets to all events that don't have them or have an empty list
        result = mongo.db.events.update_many(
            {"$or": [{"tickets": {"$exists": False}}, {"tickets": {"$size": 0}}]},
            {"$set": {"tickets": tickets}}
        )
        print(f"Updated {result.modified_count} events with default tickets.")

if __name__ == '__main__':
    add_tickets()
