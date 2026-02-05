
from src.database import mongo
from src.config import Config
from flask import Flask
import pprint

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("Checking host_applications collection...")
    try:
        apps = list(mongo.db.host_applications.find())
        print(f"Found {len(apps)} applications.")
        for a in apps:
            pprint.pprint(a)
    except Exception as e:
        print(f"Error: {e}")
