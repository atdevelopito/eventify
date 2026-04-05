"""
Auth Middleware: Contains all Flask request decorators for authentication and authorization.
Separates the 'how' of security from the 'where' of routes.
"""
from functools import wraps
from flask import request, jsonify
from src.utils.security import Security
from src.models.user_model import User

# Role Hierarchy
ROLE_HIERARCHY = {
    'unverified': 0,
    'user': 1,
    'organizer': 2,
    'admin': 3,
}

def _get_role_level(role_name):
    return ROLE_HIERARCHY.get(role_name, 0)

def _normalize_user(user_doc):
    if not user_doc: return None
    normalized = dict(user_doc)
    normalized['id'] = str(user_doc.get('_id', ''))
    return normalized

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Authentication required'}), 401
        
        user_id = Security.verify_token(token)
        if not user_id:
            return jsonify({'message': 'Token is invalid or expired'}), 401
            
        current_user = User.find_by_id(user_id)
        if not current_user:
            return jsonify({'message': 'User not found'}), 401

        current_user = _normalize_user(current_user)
        return f(current_user, *args, **kwargs)
    return decorated

def role_required(minimum_role):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(current_user, *args, **kwargs):
            user_role = current_user.get('role', 'unverified')
            
            # Backwards compat for legacy organizer flag
            if minimum_role == 'organizer' and current_user.get('is_organizer'):
                return f(current_user, *args, **kwargs)
            
            if _get_role_level(user_role) < _get_role_level(minimum_role):
                return jsonify({'message': f'{minimum_role.capitalize()} access required'}), 403
            
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator

admin_required = role_required('admin')
organizer_required = role_required('organizer')
