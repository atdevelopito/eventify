import pytest
from app import app as flask_app
import mongomock
from src.database import mongo

@pytest.fixture
def app():
    flask_app.config.update({
        "TESTING": True,
        "MONGO_URI": "mongodb://localhost:27017/testdb"
    })
    
    # Patch mongo client with mongomock
    mongo.db = mongomock.MongoClient().testdb
    return flask_app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_header(client):
    """Utility to get an auth header for a test user."""
    # This is a mock/sample implementation
    return {"Authorization": "Bearer sample_token"}
