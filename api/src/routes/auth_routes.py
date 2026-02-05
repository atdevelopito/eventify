
from flask import Blueprint, request, jsonify
from src.models.user_model import User
from src.models.password_reset import PasswordReset
from src.services.email_service import EmailService
from src.utils.security import Security
from email_validator import validate_email, EmailNotValidError
from src.utils.limiter import limiter
from datetime import datetime
from src.database import mongo

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("100 per minute")
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
        'user_agent': request.user_agent.string,
        'approx_location': request.remote_addr # In production, use GeoIP
    }

    user_id, token, error = User.create_user(email, password, name, metadata)
    if error:
        return jsonify({'message': error}), 400

    # Auto-login: Generate JWT for the new unverified user
    jwt_token = Security.generate_token(user_id)
    
    # Send verification email
    email_sent = EmailService.send_verification_email(email, token)
    
    response_data = {
        'message': 'User created successfully. Please verify your email.',
        'token': jwt_token,
        'user': {
            'email': email,
            'name': name,
            'role': 'unverified',
            'is_verified': False,
            'isOrganizer': False,
            'avatar_url': None,
            'id': user_id
        },
        # return verification_token for development since email might fail
        'dev_verification_token': token, 
        'email_sent': email_sent
    }
    
    if not email_sent:
        response_data['message'] = 'User created, but email failed. Use dev_verification_token to verify manually.'
        # Return 201 even if email fails, so user isn't blocked
        return jsonify(response_data), 201

    return jsonify(response_data), 201

@auth_bp.route('/verify', methods=['POST'])
@limiter.limit("100 per minute")
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
@limiter.limit("50 per minute")
def resend_verification():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    token, error = User.regenerate_verification_token(email)
    if error:
        return jsonify({'message': error}), 400

    # Send verification email
    email_sent = EmailService.send_verification_email(email, token)
    
    response_data = {
        'message': 'Verification email sent.',
        'dev_verification_token': token,
        'email_sent': email_sent
    }
    
    if not email_sent:
        response_data['message'] = 'Email failed (Dev Mode). Use dev_verification_token.'
        
    return jsonify(response_data), 200

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("100 per minute")
def login():
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

    # Generate JWT
    token = Security.generate_token(user['_id'])
    
    return jsonify({
        'token': token, 
        'user': {
            'email': user['email'],
            'name': user.get('name', ''),
            'role': user.get('role'),
            'id': str(user['_id']),
            'is_verified': user.get('is_verified', False),
            'isOrganizer': user.get('is_organizer', False),
            'avatar_url': user.get('avatar_url')
        }
    }), 200

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
    
    if EmailService.send_password_reset_email(email, token):
        return jsonify({'message': 'Password reset link sent to your email.'}), 200
    else:
        return jsonify({'message': 'Failed to send email. Please try again later.'}), 500

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
