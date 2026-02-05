import sys
print(f"Python: {sys.executable}")
print(f"Path: {sys.path}")
try:
    import flask_pymongo
    print(f"Flask-PyMongo found at: {flask_pymongo.__file__}")
except ImportError:
    print("Flask-PyMongo NOT found")
except Exception as e:
    print(f"Error importing: {e}")
