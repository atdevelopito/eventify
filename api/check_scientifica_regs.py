from src.database import mongo
from src.config import Config
from flask import Flask

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

event_id = "69827588346b678da85f270d"

with app.app_context():
    print(f"Checking registrations for Event ID: {event_id}")
    regs = list(mongo.db.registrations.find({"event_id": event_id}))
    print(f"Found {len(regs)} registrations.")
    
    for reg in regs:
        print(f"Reg ID: {reg['_id']} | Status: {reg.get('status')} | Payment: {reg.get('payment_status')}")
