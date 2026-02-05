from src.database import mongo
from flask import Flask
from src.config import Config

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    events = list(mongo.db.events.find({}, {"title": 1, "background_image_url": 1}))
    with open('image_debug.txt', 'w', encoding='utf-8') as f:
        f.write(f"Total events found: {len(events)}\n")
        for event in events:
            title = event.get('title', 'Unknown')
            url = event.get('background_image_url', 'None')
            f.write(f"ID: {str(event.get('_id'))} | Title: {title} | URL: {url}\n")
    print("Done writing to image_debug.txt")
