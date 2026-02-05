
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
        return bcrypt.checkpw(user_password.encode('utf-8'), hashed_password)

    @staticmethod
    def generate_token(user_id):
        payload = {
            'user_id': str(user_id),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

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
