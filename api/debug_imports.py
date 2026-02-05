import sys
print(f"Python executable: {sys.executable}")
try:
    import pymongo
    print(f"PyMongo version: {pymongo.version}")
    print(f"PyMongo file: {pymongo.__file__}")
except ImportError:
    print("PyMongo not found")

try:
    import flask_pymongo
    print(f"Flask-PyMongo file: {flask_pymongo.__file__}")
except ImportError:
    print("Flask-PyMongo not found")
