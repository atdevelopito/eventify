
from functools import wraps
from flask import request, jsonify
from src.utils.security import Security
from src.models.user_model import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            response = jsonify({})
            # Manually inject headers to ensure browser accepts the preflight
            origin = request.headers.get('Origin')
            if origin == 'https://eventify.fun':
                response.headers.add('Access-Control-Allow-Origin', origin)
            else:
                response.headers.add('Access-Control-Allow-Origin', 'https://eventify.fun') # Default
                
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 200
            
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        user_id = Security.verify_token(token)
        if not user_id:
            return jsonify({'message': 'Token is invalid or expired!'}), 401
            
        current_user = User.find_by_id(user_id)
        if not current_user:
            return jsonify({'message': 'User not found!'}), 401

        return f(current_user, *args, **kwargs)
    
    return decorated
