"""
AuthService: Encapsulates all authentication and authorization logic.
Separates business logic from the routing layer for better maintainability.
"""
from flask import request, g
from src.models.user_model import User
from src.utils.security import Security
from src.tasks.email_tasks import send_verification_email_task
from src.database import mongo
from datetime import datetime

class AuthService:
    @staticmethod
    def register_user(email, password, name, metadata):
        """Handle user registration, token generation, and background verification email."""
        user_id, token, error = User.create_user(email, password, name, metadata)
        if error:
            return None, error

        # Issue initial tokens
        access_token = Security.generate_token(user_id)
        refresh_token = Security.generate_refresh_token(user_id)
        
        # Trigger async task
        send_verification_email_task.delay(email, token)
        
        return {
            "user_id": user_id,
            "verification_token": token,
            "access_token": access_token,
            "refresh_token": refresh_token
        }, None

    @staticmethod
    def login_user(email, password):
        """Handle user authentication and 2FA core logic."""
        user = User.find_by_email(email)
        
        if not user or not Security.check_password(user['password'], password):
            return None, "Invalid email or password", 401
            
        if not user.get('is_verified', False):
            return None, "Account not verified", 403

        # Return user and let the route handle 2FA/token creation for now
        # Or encapsulate 2FA check here too.
        return user, None, 200

    @staticmethod
    def verify_email(token):
        """Handle email verification logic."""
        return User.verify_user(token)
