from src.database import mongo
from src.config import Config
from flask import Flask

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("Starting duplicate ticket cleanup...")
    
    # 1. Get all registrations
    registrations = list(mongo.db.registrations.find({}))
    total_cleaned = 0
    
    for reg in registrations:
        reg_id = str(reg['_id'])
        quantity = reg.get('quantity', 1)
        
        # 2. Get tickets for this registration
        tickets = list(mongo.db.tickets.find({"registration_id": reg_id}))
        ticket_count = len(tickets)
        
        if ticket_count > quantity:
            excess = ticket_count - quantity
            print(f"Registration {reg_id}: Found {ticket_count} tickets for quantity {quantity}. Removing {excess} duplicates.")
            
            # Sort tickets by creation time (descending) to remove newest duplicates first, or just arbitrary
            # Since duplicates probably have same timestamp, we just rely on ID
            # Keep the first 'quantity' tickets, delete the rest
            tickets_to_keep = tickets[:quantity]
            tickets_to_delete = tickets[quantity:]
            
            for t in tickets_to_delete:
                mongo.db.tickets.delete_one({"_id": t['_id']})
                print(f"  - Deleted duplicate ticket: {t['_id']}")
            
            total_cleaned += excess
            
    print(f"Cleanup complete. Removed {total_cleaned} duplicate tickets.")
