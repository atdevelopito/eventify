
import bcrypt
import jwt
import datetime
import secrets
from src.config import Config

class Security:
    @staticmethod
    def hash_password(password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    @staticmethod
    def check_password(hashed_password, user_password):
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        if isinstance(user_password, str):
            user_password = user_password.encode('utf-8')
        return bcrypt.checkpw(user_password, hashed_password)

    @staticmethod
    def generate_token(user_id, role=None):
        payload = {
            'user_id': str(user_id),
            'role': role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15),
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

    @staticmethod
    def generate_refresh_token(user_id):
        from src.database import mongo
        token = secrets.token_urlsafe(64)
        mongo.db.refresh_tokens.insert_one({
            "user_id": str(user_id),
            "token": token,
            "is_used": False,
            "expires_at": datetime.datetime.utcnow() + datetime.timedelta(days=7),
            "created_at": datetime.datetime.utcnow(),
            "revoked_at": None
        })
        return token

    @staticmethod
    def verify_token(token):
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            return payload['user_id']
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    @staticmethod
    def generate_verification_code():
        return secrets.token_urlsafe(32)  # Generates a secure random string

    @staticmethod
    def generate_reset_token():
        return secrets.token_urlsafe(32)
