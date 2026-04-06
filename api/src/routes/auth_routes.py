from flask import Blueprint, request, jsonify
from src.models.user_model import User
from src.models.password_reset import PasswordReset
from src.services.email_service import EmailService
from src.services.auth_service import AuthService
from src.tasks.email_tasks import send_verification_email_task, send_password_reset_email_task
from src.utils.security import Security
from email_validator import validate_email, EmailNotValidError
from src.utils.limiter import limiter
from datetime import datetime
from src.database import mongo
from src.utils.tfa import TFA
from src.middleware.auth_middleware import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("10 per minute")
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({'message': 'Name, email, and password are required'}), 400

    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({'message': str(e)}), 400

    metadata = {
        'ip_address': request.remote_addr,
        'user_agent': request.user_agent.string
    }

    # Delegate to Service
    result, error = AuthService.register_user(email, password, name, metadata)
    if error:
        return jsonify({'message': error}), 400

    # Dispatch verification email task
    send_verification_email_task.delay(email, result['verification_token'])

    from flask import make_response
    response_data = {
        'message': 'User created successfully. Please verify your email.',
        'token': result['access_token'],
        'user': {
            'email': email,
            'name': name,
            'role': 'unverified',
            'is_verified': False,
            'id': result['user_id']
        },
        'dev_verification_token': result['verification_token'] # for dev
    }
    
    response = make_response(jsonify(response_data), 201)
    is_production = not request.host.startswith('localhost') and not request.host.startswith('127.')
    response.set_cookie(
        'refresh_token',
        result['refresh_token'],
        httponly=True,
        secure=is_production,
        samesite='Lax',
        max_age=7 * 24 * 60 * 60,
        path='/api/auth'
    )
    return response

@auth_bp.route('/verify', methods=['POST'])
@limiter.limit("20 per minute")
def verify():
    # Expecting { "token": "..." } or query param ?token=...
    token = request.args.get('token') or request.json.get('token')
    
    if not token:
        return jsonify({'message': 'Token is required'}), 400

    success, message = User.verify_user(token)
    if not success:
        return jsonify({'message': message}), 400

    return jsonify({'message': message}), 200

@auth_bp.route('/resend-verification', methods=['POST'])
@limiter.limit("5 per minute")
def resend_verification():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    token, error = User.regenerate_verification_token(email)
    if error:
        return jsonify({'message': error}), 400

    # Send verification email
    send_verification_email_task.delay(email, token)
    
    response_data = {
        'message': 'Verification email sent.',
        'dev_verification_token': token,
        'email_sent': True
    }
        
    return jsonify(response_data), 200

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    from flask import make_response
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.find_by_email(email)
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401

    if not Security.check_password(user['password'], password):
        return jsonify({'message': 'Invalid credentials'}), 401

    if not user.get('is_verified', False):
        return jsonify({'message': 'Account not verified. Please verify your email.'}), 403

    # 2FA CHECK
    if user.get('is_tfa_enabled'):
        mfa_token = Security.generate_token(str(user['_id']), role='mfa_pending')
        return jsonify({
            'mfa_required': True,
            'mfa_token': mfa_token,
            'message': 'Two-Factor Authentication required.'
        }), 200

    # User found, password matches — Issue tokens
    access_token = Security.generate_token(str(user['_id']), user.get('role'))
    refresh_token = Security.generate_refresh_token(str(user['_id']))
    
    response = make_response(jsonify({
        'token': access_token, 
        'user': {
            'email': user['email'],
            'name': user.get('name', ''),
            'role': user.get('role'),
            'id': str(user['_id']),
            'is_verified': user.get('is_verified', False),
            'isOrganizer': user.get('is_organizer', False),
            'isTfaEnabled': user.get('is_tfa_enabled', False),
            'avatar_url': user.get('avatar_url')
        }
    }))

    # Set refresh token as HttpOnly cookie — invisible to JavaScript
    is_production = not request.host.startswith('localhost') and not request.host.startswith('127.')
    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        secure=is_production,      # Secure=True only over HTTPS in prod
        samesite='Lax',
        max_age=7 * 24 * 60 * 60,  # 7 days
        path='/api/auth'            # Only sent to auth endpoints
    )

    return response, 200


@auth_bp.route('/refresh', methods=['POST'])
@limiter.limit("30 per minute")
def refresh():
    """Rotate refresh token and issue a new access token."""
    from flask import make_response
    refresh_token = request.cookies.get('refresh_token')

    if not refresh_token:
        return jsonify({"message": "Refresh token missing"}), 401

    token_record = mongo.db.refresh_tokens.find_one({"token": refresh_token})

    if not token_record:
        return jsonify({"message": "Invalid token"}), 401

    # REPLAY DETECTION TRAP — if a used token is resubmitted, assume breach
    if token_record.get('is_used'):
        # Revoke ALL sessions for this user immediately
        mongo.db.refresh_tokens.update_many(
            {"user_id": token_record['user_id']},
            {"$set": {"revoked_at": datetime.utcnow()}}
        )
        resp = make_response(jsonify({"message": "Security breach detected. All sessions revoked. Please log in again."}))
        resp.set_cookie('refresh_token', '', expires=0, httponly=True, path='/api/auth')
        return resp, 403

    if token_record.get('revoked_at') or token_record['expires_at'] < datetime.utcnow():
        return jsonify({"message": "Token expired or revoked"}), 401

    # Mark current token as used (one-time use)
    mongo.db.refresh_tokens.update_one(
        {"_id": token_record['_id']},
        {"$set": {"is_used": True}}
    )

    # Look up user for role info
    user = User.find_by_id(token_record['user_id'])
    user_role = user.get('role') if user else None

    # Issue fresh pair
    new_access = Security.generate_token(token_record['user_id'], user_role)
    new_refresh = Security.generate_refresh_token(token_record['user_id'])

    response = make_response(jsonify({
        'token': new_access
    }))

    is_production = not request.host.startswith('localhost') and not request.host.startswith('127.')
    response.set_cookie(
        'refresh_token',
        new_refresh,
        httponly=True,
        secure=is_production,
        samesite='Lax',
        max_age=7 * 24 * 60 * 60,
        path='/api/auth'
    )

    return response, 200


@auth_bp.route('/logout', methods=['POST'])
@limiter.limit("50 per minute")
def logout():
    """Revoke refresh token and clear cookie."""
    from flask import make_response
    refresh_token = request.cookies.get('refresh_token')

    if refresh_token:
        mongo.db.refresh_tokens.update_one(
            {"token": refresh_token},
            {"$set": {"revoked_at": datetime.utcnow()}}
        )

    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.set_cookie('refresh_token', '', expires=0, httponly=True, path='/api/auth')

    return response, 200

# ----- 2FA ENDPOINTS -----

@auth_bp.route('/2fa/setup', methods=['GET'])
@token_required
def tfa_setup(current_user):
    """Generates a new 2FA secret and QR code for the user."""
    if current_user.get('is_tfa_enabled'):
        return jsonify({"message": "2FA is already enabled"}), 400
        
    secret = TFA.generate_secret()
    # Save as pending so it doesn't break current logins until verified
    mongo.db.users.update_one(
        {"_id": current_user['_id']},
        {"$set": {"pending_tfa_secret": secret}}
    )
    
    uri = TFA.get_provisioning_uri(current_user['email'], secret)
    qr_code = TFA.generate_qr_code_base64(uri)
    
    return jsonify({
        "qr_code": f"data:image/png;base64,{qr_code}",
        "secret": secret # Show manual entry secret too
    }), 200

@auth_bp.route('/2fa/verify-setup', methods=['POST'])
@token_required
def tfa_verify_setup(current_user):
    """Verifies the first 2FA code and enables 2FA for the account."""
    data = request.json
    code = data.get('code')
    
    if not code:
        return jsonify({"message": "Code is required"}), 400
        
    secret = current_user.get('pending_tfa_secret')
    if not secret:
        return jsonify({"message": "No pending 2FA setup found"}), 400
        
    if TFA.verify_totp(secret, code):
        mongo.db.users.update_one(
            {"_id": current_user['_id']},
            {
                "$set": {
                    "is_tfa_enabled": True,
                    "tfa_secret": secret
                },
                "$unset": {"pending_tfa_secret": ""}
            }
        )
        return jsonify({"message": "Two-Factor Authentication enabled successfully"}), 200
    else:
        return jsonify({"message": "Invalid code. Please try again."}), 400

@auth_bp.route('/login/2fa', methods=['POST'])
@limiter.limit("10 per minute")
def login_2fa():
    """Verify the 2FA code during login."""
    from flask import make_response
    data = request.json
    mfa_token = data.get('mfa_token')
    code = data.get('code')
    
    if not mfa_token or not code:
        return jsonify({"message": "MFA token and code are required"}), 400
        
    user_id = Security.verify_token(mfa_token)
    if not user_id:
        return jsonify({"message": "Invalid or expired MFA session"}), 401
        
    user = User.find_by_id(user_id)
    if not user or not user.get('is_tfa_enabled'):
        return jsonify({"message": "User not found or 2FA not enabled"}), 401
        
    if TFA.verify_totp(user['tfa_secret'], code):
        # Issue production tokens
        access_token = Security.generate_token(str(user['_id']), user.get('role'))
        refresh_token = Security.generate_refresh_token(str(user['_id']))
        
        response = make_response(jsonify({
            'token': access_token,
            'user': {
                'email': user['email'],
                'name': user.get('name', ''),
                'role': user.get('role'),
                'id': str(user['_id']),
                'isTfaEnabled': True
            }
        }))
        
        is_production = not request.host.startswith('localhost') and not request.host.startswith('127.')
        response.set_cookie(
            'refresh_token',
            refresh_token,
            httponly=True,
            secure=is_production,
            samesite='Lax',
            max_age=7 * 24 * 60 * 60,
            path='/api/auth'
        )
        return response, 200
    else:
        return jsonify({"message": "Invalid 2FA code"}), 401

@auth_bp.route('/forgot-password', methods=['POST'])
@limiter.limit("50 per minute")
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    user = User.find_by_email(email)
    if not user:
        # Don't reveal user existence
        return jsonify({'message': 'If an account exists, a reset link has been sent.'}), 200

    token = PasswordReset.create_token(user['_id'], email)
    
    # Send reset link in background
    send_password_reset_email_task.delay(email, token)
    return jsonify({"message": "If this email is registered, a reset link will be sent shortly."}), 200

@auth_bp.route('/reset-password', methods=['POST'])
@limiter.limit("50 per minute")
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({'message': 'Token and new_password are required'}), 400

    reset_record = PasswordReset.find_token(token)
    if not reset_record:
        return jsonify({'message': 'Invalid or expired token'}), 400
        
    if reset_record['expires_at'] < datetime.utcnow():
        PasswordReset.delete_token(token)
        return jsonify({'message': 'Token expired'}), 400

    # Update User Password
    hashed_password = Security.hash_password(new_password)
    mongo.db.users.update_one(
        {"_id": reset_record['user_id']},
        {"$set": {"password": hashed_password}}
    )

    # Delete Reset Token
    PasswordReset.delete_token(token)

    return jsonify({'message': 'Password reset successfully'}), 200
