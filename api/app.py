

from flask import Flask, request
from src.config import Config
from src.database import mongo
from src.routes.auth_routes import auth_bp
import sys
import pymongo
# print(f"DEBUG: Python: {sys.executable}")
# print(f"DEBUG: PyMongo: {pymongo.version}")

from flask_cors import CORS

app = Flask(__name__)
app.config.from_object(Config)

print("Starting Eventify API...")
print(f"MongoDB URI present: {bool(app.config.get('MONGO_URI'))}")

# Initialize CORS with support for frontend origin and credentials
# Allow all local network IPs and localhost
CORS(app, 
     origins=[
         "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176",
         "https://eventify.fun", "https://organizer.eventify.fun",
         r"http://192\.168\.\d{1,3}\.\d{1,3}:\d{4}",  # Wildcard for any local IP/Port
         r"http://127\.0\.0\.1:\d{4}"
     ],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     expose_headers=["Content-Type", "Authorization"])

# Initialize extensions
mongo.init_app(app)
from src.utils.limiter import limiter
limiter.init_app(app)

with app.app_context():
    from src.utils.indexes import create_indexes
    create_indexes()

# Register blueprints
# Register blueprints
from src.routes.auth_routes import auth_bp
from src.routes.user_routes import user_bp
from src.routes.event_routes import event_bp, public_bp
from src.routes.upload_routes import upload_bp
# 
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(event_bp, url_prefix='/api/events')
app.register_blueprint(public_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api/upload')
# 
from src.routes.registration_routes import registration_bp
app.register_blueprint(registration_bp, url_prefix='/api/registrations')

from src.routes.ticket_routes import ticket_bp
app.register_blueprint(ticket_bp, url_prefix='/api/tickets')

from src.routes.organizer_routes import organizer_bp
app.register_blueprint(organizer_bp, url_prefix='/api/organizer')

# from src.routes.analytics_routes import analytics_bp
# app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

from src.routes.form_routes import form_bp
app.register_blueprint(form_bp, url_prefix='/api/forms')
# 
# from src.routes.promotion_routes import promotion_bp
# app.register_blueprint(promotion_bp, url_prefix='/api/promotions')
# 
# from src.routes.merchandise_routes import merchandise_bp
# app.register_blueprint(merchandise_bp, url_prefix='/api/merchandise')
# 
from src.routes.team_routes import team_bp
app.register_blueprint(team_bp, url_prefix='/api/team')

from src.routes.follow_routes import follow_bp
app.register_blueprint(follow_bp, url_prefix='/api/follows')

from src.routes.host_application_routes import host_application_bp
app.register_blueprint(host_application_bp, url_prefix='/api/host-applications')

from src.routes.admin_routes import admin_bp
app.register_blueprint(admin_bp, url_prefix='/api/admin')


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    from flask import send_from_directory
    import os
    # Serve files from the uploads directory
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    return send_from_directory(uploads_dir, filename)

@app.before_request
def log_request_info():
    print(f"Request: {request.method} {request.path}")

@app.route("/")
def home():
    print("Printing available routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule}: {rule.methods}")
    return {"status": "ok", "message": "Eventify API is running"}

@app.route("/api/ping")
def ping():
    return {"status": "ok", "message": "Pong"}, 200

@app.route("/healthz")
def healthz():
    return {"status": "ok"}, 200

@app.route("/debug/db")
def debug_db():
    try:
        db_name = mongo.db.name
        collections = mongo.db.list_collection_names()
        event_count = mongo.db.events.count_documents({})
        featured_count = mongo.db.events.count_documents({"is_featured": True})
        published_count = mongo.db.events.count_documents({"status": "published"})
        return {
            "db_name": db_name,
            "collections": collections,
            "event_count": event_count,
            "featured_count": featured_count,
            "published_count": published_count,
            "uri_masked": "present" if app.config.get('MONGO_URI') else "missing"
        }
    except Exception as e:
        return {"error": str(e)}, 500


@app.errorhandler(404)
def handle_404(e):
    # Log the exact path that failed
    print(f"404 Error: {request.method} {request.path}")
    return {"error": "not_found", "path": request.path, "message": "The requested URL was not found on the server."}, 404

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)
