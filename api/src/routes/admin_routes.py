from flask import Blueprint, request, jsonify
from src.database import mongo

from bson import ObjectId
from datetime import datetime
from src.utils.decorators import token_required

admin_bp = Blueprint('admin', __name__)

# Middleware to check if user is admin
def admin_required(f):
    @token_required
    def decorated_function(current_user, *args, **kwargs):
        # DEV MODE: Bypass admin check
        # if current_user.get('role') != 'admin':
        #    return jsonify({'message': 'Admin privileges required'}), 403
        return f(current_user, *args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@admin_bp.route('/applications', methods=['GET'])
@admin_required
def get_all_applications(current_user):
    try:
        # Fetch pending applications first, then others if needed. Or just all.
        # Let's support query param status
        status = request.args.get('status')
        query = {}
        if status:
            query['status'] = status
            
        applications = list(mongo.db.host_applications.find(query).sort('created_at', -1))
        
        # Serialize
        for app in applications:
            app['_id'] = str(app['_id'])
            if 'user_id' in app:
                app['user_id'] = str(app['user_id'])
            if 'reviewed_by' in app:
                app['reviewed_by'] = str(app['reviewed_by'])
            if 'created_at' in app and isinstance(app['created_at'], datetime):
                app['created_at'] = app['created_at'].isoformat()
            if 'updated_at' in app and isinstance(app['updated_at'], datetime):
                app['updated_at'] = app['updated_at'].isoformat()
            
        return jsonify(applications), 200
    except Exception as e:
        print(f"Error fetching applications: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

@admin_bp.route('/applications/<id>/approve', methods=['POST'])
@admin_required
def approve_application(current_user, id):
    try:
        # 1. Update application status
        result = mongo.db.host_applications.find_one_and_update(
            {'_id': ObjectId(id)},
            {'$set': {
                'status': 'approved', 
                'updated_at': datetime.utcnow(),
                'reviewed_by': current_user['_id']
            }},
            return_document=True
        )
        
        if not result:
            return jsonify({'message': 'Application not found'}), 404
            
        # 2. Update User role/is_organizer status
        # Assuming the application has a user_id
        user_id = result['user_id']
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_organizer': True, 'role': 'organizer'}} # Or keep role, just set flag
        )
        
        # notification
        try:
             # Fetch user email and name (from application or user record)
             # The application document has 'email' and 'full_name'
             app = result
             email = app.get('email')
             name = app.get('full_name') or 'Organizer'
             
             if email:
                from src.services.email_service import EmailService
                EmailService.send_organizer_approval_email(email, name)
        except Exception as e:
            print(f"Failed to send approval email: {e}")
        
        return jsonify({'message': 'Application approved'}), 200
    except Exception as e:
        print(f"Error approving application: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

@admin_bp.route('/applications/<id>/reject', methods=['POST'])
@admin_required
def reject_application(current_user, id):
    try:
        data = request.get_json() or {}
        reason = data.get('reason', 'Requirements not met')
        
        result = mongo.db.host_applications.find_one_and_update(
            {'_id': ObjectId(id)},
            {'$set': {
                'status': 'rejected', 
                'rejection_reason': reason,
                'updated_at': datetime.utcnow(),
                'reviewed_by': current_user['_id']
            }}
        )
        
        if not result:
            return jsonify({'message': 'Application not found'}), 404
            
        return jsonify({'message': 'Application rejected'}), 200
    except Exception as e:
        print(f"Error rejecting application: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

@admin_bp.route('/events/<id>/feature', methods=['PUT'])
@admin_required
def toggle_feature_event(current_user, id):
    try:
        data = request.get_json()
        is_featured = data.get('is_featured', False)
        
        result = mongo.db.events.find_one_and_update(
            {'_id': ObjectId(id)},
            {'$set': {'is_featured': is_featured}},
            return_document=True
        )
        
        if not result:
            return jsonify({'message': 'Event not found'}), 404
            
        return jsonify({
            'message': 'Event feature status updated', 
            'is_featured': result.get('is_featured')
        }), 200
    except Exception as e:
        print(f"Error toggling event feature: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
