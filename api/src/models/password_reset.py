
from datetime import datetime, timedelta
from src.database import mongo
from src.utils.security import Security

class PasswordReset:
    @staticmethod
    def create_token(user_id, email):
        token = Security.generate_reset_token()
        reset_entry = {
            "user_id": user_id,
            "token": token,
            "email": email, # Storing email for quick lookup/validation if needed
            "expires_at": datetime.utcnow() + timedelta(hours=24),
            "created_at": datetime.utcnow()
        }
        mongo.db.password_resets.insert_one(reset_entry)
        return token

    @staticmethod
    def find_token(token):
        return mongo.db.password_resets.find_one({"token": token})

    @staticmethod
    def delete_token(token):
        mongo.db.password_resets.delete_one({"token": token})
