
from src.database import mongo
from src.config import Config
from flask import Flask
from bson.objectid import ObjectId
from datetime import datetime
import pprint

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("\n--- Last 15 Registrations (Newest First) ---")
    regs = list(mongo.db.registrations.find().sort('_id', -1).limit(15))
    
    for i, reg in enumerate(regs):
        event_id = reg.get('event_id')
        event = None
        if event_id:
             try:
                event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
             except:
                if isinstance(event_id, str):
                    event = mongo.db.events.find_one({"_id": event_id})
        
        event_title = event.get('title') if event else "UNKNOWN_EVENT"
        event_id_str = str(event.get('_id')) if event else "N/A"
        reg_date = reg.get('registered_at')
        event_date = event.get('date') if event else "N/A"
        event_target = event.get('target_date') if event else "N/A"
        event_start = event.get('start_date') if event else "N/A"
        
        # Check tickets
        ticket_count = mongo.db.tickets.count_documents({"registration_id": str(reg['_id'])})
        
        print(f"#{i+1} | RegDate: {reg_date} | Ev: {event_title} | ID: {event_id_str}")
        print(f"   St: {reg.get('status')} | Pay: {reg.get('payment_status')} | Tix: {ticket_count}")
        print(f"   EvDate: {event_date} | Target: {event_target} | Start: {event_start}")
        # print(f"   Ticket Type: {reg.get('ticket_type')}")
