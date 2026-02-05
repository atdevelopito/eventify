
from datetime import datetime, timedelta
from src.database import mongo
from src.utils.security import Security
from bson.objectid import ObjectId

class User:
    @staticmethod
    def create_user(email, password, name, metadata):
        if mongo.db.users.find_one({"email": email}):
            return None, None, "User already exists"

        hashed_password = Security.hash_password(password)
        verification_token = Security.generate_verification_code()
        
        user = {
            "email": email,
            "password": hashed_password,
            "name": name,
            "role": "unverified",
            "is_verified": False,
            "is_organizer": False, # Default to False
            "verification_token": verification_token,
            "verification_expires_at": datetime.utcnow() + timedelta(days=7),
            "created_at": datetime.utcnow(),
            "metadata": metadata
        }
        
        result = mongo.db.users.insert_one(user)
        return str(result.inserted_id), verification_token, None

    @staticmethod
    def find_by_email(email):
        return mongo.db.users.find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        try:
            return mongo.db.users.find_one({"_id": ObjectId(user_id)})
        except:
            return None

    @staticmethod
    def verify_user(token):
        user = mongo.db.users.find_one({"verification_token": token})
        if not user:
            return False, "Invalid verification token"
            
        if user.get('verification_expires_at') and user['verification_expires_at'] < datetime.utcnow():
            return False, "Verification token expired"
            
        mongo.db.users.update_one(
            {"_id": user['_id']},
            {
                "$set": {"is_verified": True, "role": "user"}, 
                "$unset": {
                    "verification_token": "", 
                    "verification_expires_at": "",
                    "verification_code": "", 
                    "verification_code_expires": ""
                }
            }
        )
        return True, "User verified successfully"

    @staticmethod
    def regenerate_verification_token(email):
        user = mongo.db.users.find_one({"email": email})
        if not user:
            return None, "User not found"
        
        if user.get('is_verified'):
            return None, "User already verified"
            
        new_token = Security.generate_verification_code()
        mongo.db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "verification_token": new_token,
                    "verification_expires_at": datetime.utcnow() + timedelta(days=7)
                }
            }
        )
        return new_token, None
