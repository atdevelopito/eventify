
"""
Production-grade Role-Based Access Control (RBAC) decorators.

Role Hierarchy (highest to lowest):
    admin > organizer > user > unverified

Usage:
    @token_required                     # Any authenticated user
    @role_required('organizer')         # Organizer or Admin
    @role_required('admin')             # Admin only
    @roles_required('organizer','admin')# Explicit whitelist
    @verified_required                  # Any verified user (not unverified)
    @owner_or_admin(get_resource_owner) # Resource owner or admin
"""

from functools import wraps
from flask import request, jsonify
from src.utils.security import Security
from src.models.user_model import User


# ─── Role Hierarchy ───────────────────────────────────────────────────────────
# Higher number = more privilege. Admin inherits all lower permissions.
ROLE_HIERARCHY = {
    'unverified': 0,
    'user': 1,
    'organizer': 2,
    'admin': 3,
}

def _get_role_level(role_name):
    """Get numeric privilege level for a role."""
    return ROLE_HIERARCHY.get(role_name, 0)

def _normalize_user(user_doc):
    """Normalize a MongoDB user document into a consistent dict with 'id' as string."""
    if not user_doc:
        return None
    normalized = dict(user_doc)
    normalized['id'] = str(user_doc.get('_id', ''))
    return normalized


# ─── Core: token_required ─────────────────────────────────────────────────────
def token_required(f):
    """
    Base authentication decorator.
    Extracts and validates Bearer token, attaches current_user to handler.
    All other RBAC decorators build on top of this.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            response = jsonify({})
            origin = request.headers.get('Origin')
            allowed_origins = ['https://eventify.fun', 'http://localhost:4173', 'http://localhost:5173']
            if origin in allowed_origins:
                response.headers.add('Access-Control-Allow-Origin', origin)
            else:
                response.headers.add('Access-Control-Allow-Origin', 'https://eventify.fun')
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


# ─── Role-Based: role_required ────────────────────────────────────────────────
def role_required(minimum_role):
    """
    Requires the user to have AT LEAST the specified role level.
    Uses hierarchy: admin > organizer > user > unverified
    
    Example:
        @role_required('organizer')  # Allows organizer AND admin
        @role_required('admin')      # Admin only
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(current_user, *args, **kwargs):
            user_role = current_user.get('role', 'unverified')
            
            # Also check is_organizer flag for backwards compatibility
            if minimum_role == 'organizer' and current_user.get('is_organizer'):
                return f(current_user, *args, **kwargs)
            
            required_level = _get_role_level(minimum_role)
            user_level = _get_role_level(user_role)
            
            if user_level < required_level:
                return jsonify({
                    'message': f'{minimum_role.capitalize()} access required',
                    'error_code': 'INSUFFICIENT_ROLE',
                    'required': minimum_role,
                    'current': user_role
                }), 403
            
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


# ─── Explicit Whitelist: roles_required ───────────────────────────────────────
def roles_required(*allowed_roles):
    """
    Requires the user to have one of the EXACTLY specified roles.
    No hierarchy — strict whitelist.
    
    Example:
        @roles_required('organizer', 'admin')  # Only these two, not 'user'
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(current_user, *args, **kwargs):
            user_role = current_user.get('role', 'unverified')
            
            # Backwards compat: treat is_organizer flag as organizer role
            effective_roles = {user_role}
            if current_user.get('is_organizer'):
                effective_roles.add('organizer')
            
            if not effective_roles.intersection(set(allowed_roles)):
                return jsonify({
                    'message': 'Access denied',
                    'error_code': 'ROLE_NOT_ALLOWED',
                    'allowed': list(allowed_roles),
                    'current': user_role
                }), 403
            
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


# ─── Verification Check ──────────────────────────────────────────────────────
def verified_required(f):
    """
    Requires the user to be email-verified.
    Rejects unverified accounts with a helpful 403 message.
    """
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not current_user.get('is_verified', False):
            return jsonify({
                'message': 'Email verification required',
                'error_code': 'UNVERIFIED'
            }), 403
        return f(current_user, *args, **kwargs)
    return decorated


# ─── Resource Ownership Check ─────────────────────────────────────────────────
def owner_or_admin(get_owner_id_fn):
    """
    Allows access if the user is the resource owner OR an admin.
    
    get_owner_id_fn: A callable that takes (current_user, **kwargs) 
                     and returns the owner's user_id string.
    
    Example:
        def get_event_owner(current_user, event_id, **kw):
            event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
            return str(event['created_by']) if event else None
        
        @owner_or_admin(get_event_owner)
        def update_event(current_user, event_id):
            ...
    """
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(current_user, *args, **kwargs):
            user_id = current_user.get('id')
            user_role = current_user.get('role', 'unverified')
            
            # Admin always passes
            if user_role == 'admin':
                return f(current_user, *args, **kwargs)
            
            # Check ownership
            owner_id = get_owner_id_fn(current_user, **kwargs)
            if owner_id and str(owner_id) == str(user_id):
                return f(current_user, *args, **kwargs)
            
            return jsonify({
                'message': 'Access denied — you do not own this resource',
                'error_code': 'NOT_OWNER'
            }), 403
        return decorated
    return decorator


# ─── Convenience Aliases ──────────────────────────────────────────────────────
admin_required = role_required('admin')
organizer_required = role_required('organizer')
