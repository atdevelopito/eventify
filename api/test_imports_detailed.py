import traceback
import sys

try:
    print("1. Importing Flask...")
    from flask import Flask
    print("OK")

    print("2. Importing Config...")
    from src.config import Config
    print("OK")

    print("3. Importing mongo...")
    from src.database import mongo
    print("OK")

    print("4. Creating app...")
    app = Flask(__name__)
    app.config.from_object(Config)
    print("OK")

    print("5. Initializing mongo...")
    mongo.init_app(app)
    print("OK")

    print("6. Importing auth_routes...")
    from src.routes.auth_routes import auth_bp
    print("OK")

    print("7. Importing organizer_routes...")
    from src.routes.organizer_routes import organizer_bp
    print("OK")

    print("ALL IMPORTS SUCCESSFUL!")
except Exception as e:
    print(f"\n\nERROR: {e}")
    print("\nFull Traceback:")
    traceback.print_exc()
    sys.exit(1)
