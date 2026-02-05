from pymongo import MongoClient
import os

class PyMongo:
    def __init__(self, app=None):
        self.cx = None
        self.db = None
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        uri = app.config.get("MONGO_URI") or os.getenv("MONGODB_URI")
        if not uri:
            raise RuntimeError("MONGO_URI not found in config or env")
        
        self.cx = MongoClient(uri)
        # Assuming database name is in URI or default 'eventify'
        # pymongo .get_database() uses the one in URI if present
        try:
            self.db = self.cx.get_database()
        except:
            self.db = self.cx.eventify
        
        # Backward compatibility for existing code using mongo.db
        # FLask-PyMongo usually exposes db as the database object

mongo = PyMongo()
