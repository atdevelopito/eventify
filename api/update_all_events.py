from src.database import mongo
from src.config import Config
from flask import Flask
from datetime import datetime, timedelta

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    # Calculate dates
    tomorrow = datetime.now() + timedelta(days=1)
    tomorrow_str = tomorrow.strftime('%Y-%m-%d')
    tomorrow_iso = tomorrow.isoformat()
    
    next_week = datetime.now() + timedelta(days=7)
    next_week_str = next_week.strftime('%Y-%m-%d')
    next_week_iso = next_week.isoformat()
    
    print("Updating ALL events to future dates...")
    
    # Update all events
    result = mongo.db.events.update_many(
        {},
        {
            "$set": {
                "target_date": tomorrow_iso,
                "date": tomorrow_str,
                "start_date": tomorrow_iso
            }
        }
    )
    
    print(f"Updated {result.modified_count} events to {tomorrow_str}")
    
    # Verify
    events = list(mongo.db.events.find())
    for e in events:
        print(f"Event: {e.get('title')} | Date: {e.get('date')}")
