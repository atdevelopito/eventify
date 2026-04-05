import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
import os
import uuid
import logging
from flask import Flask, request, g, jsonify
from datetime import datetime
from src.config import Config
from src.database import mongo
from src.routes.auth_routes import auth_bp
import sys
import pymongo
# print(f"DEBUG: Python: {sys.executable}")
# print(f"DEBUG: PyMongo: {pymongo.version}")

from flask_talisman import Talisman
from flask_cors import CORS

# Configure Sentry (Error Tracking)
SENTRY_DSN = os.getenv('SENTRY_DSN')
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[FlaskIntegration()],
        traces_sample_rate=0.1, # 10% performance tracing
        profiles_sample_rate=0.1,
    )

# Centralized Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [%(request_id)s] %(message)s',
)

app = Flask(__name__)

# Request ID Middleware (Tracing)
@app.before_request
def add_request_id():
    g.request_id = request.headers.get('X-Request-Id', str(uuid.uuid4()))

# Logger with context awareness
class RequestAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        return '[%s] %s' % (getattr(g, 'request_id', 'none'), msg), kwargs

# Use app.logger as the main logging interface
app.logger = RequestAdapter(logging.getLogger('eventify'), {})

@app.route("/api/health")
def health_check():
    """Endpoint for uptime monitoring (UptimeRobot, etc.)"""
    # Check MongoDB Connectivity
    try:
        mongo.db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"unreachable: {str(e)}"
        
    return jsonify({
        "status": "ok",
        "database": db_status,
        "environment": os.getenv("FLASK_ENV", "production"),
        "timestamp": datetime.utcnow().isoformat()
    }), 200

app.config.from_object(Config)

# Security Headers (CSP, HSTS, XSS Protection)
# Default policy is restrictive; common sources for Eventify are whitelisted.
csp = {
    'default-src': '\'self\'',
    'img-src': ['*', 'data:', 'blob:'],
    'script-src': ['\'self\'', '\'unsafe-inline\''],
    'style-src': ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
    'font-src': ['\'self\'', 'https://fonts.gstatic.com'],
    'connect-src': ['\'self\'', 'https://api.eventify.fun', 'https://eventify-backend-1-iave.onrender.com', 'http://localhost:5000']
}

talisman = Talisman(
    app,
    content_security_policy=csp,
    force_https=not app.debug, # Enforce HTTPS in production
    strict_transport_security=True,
    session_cookie_secure=True,
    session_cookie_http_only=True
)

# Initialize Celery
from src.celery_app import make_celery
celery = make_celery(app)

# Initialize CORS with explicit origin whitelist (don't use *)
whitelist = [
    "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176",
    "https://eventify.fun", "https://organizer.eventify.fun", "https://admin.eventify.fun",
    "https://eventifybangladesh.netlify.app", "https://eventify-organizer.netlify.app",
    "https://eventify-backend-1-iave.onrender.com"
]
CORS(app, 
     origins=whitelist,
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

from src.routes.ai_routes import ai_bp
app.register_blueprint(ai_bp, url_prefix='/api/ai')


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    from flask import send_from_directory
    import os
    # Serve files from the uploads directory
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    return send_from_directory(uploads_dir, filename)

@app.route("/")
def home():
    return {"status": "ok", "message": "Eventify API is running"}


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)
