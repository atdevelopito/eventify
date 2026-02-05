from flask import Blueprint, request, jsonify
from src.database import mongo

from bson import ObjectId
from datetime import datetime
from src.utils.decorators import token_required

host_application_bp = Blueprint('host_applications', __name__)

@host_application_bp.route('', methods=['POST'])
@token_required
def submit_host_application(current_user):
    try:
        data = request.get_json()
        
        # Check if user already has an application
        existing_app = mongo.db.host_applications.find_one({'user_id': ObjectId(current_user['_id'])})
        if existing_app:
             # Update instead of new insert if pending? Or duplicate check?
             # For now, let's just return success if it exists in pending, or update it.
             # Or simply upsert.
             pass

        application = {
            'user_id': ObjectId(current_user['_id']),
            'full_name': data.get('full_name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'organization_name': data.get('organization_name'),
            'organization_type': data.get('organization_type'),
            'event_type': data.get('event_type'),
            'event_description': data.get('event_description'),
            'expected_attendees': data.get('expected_attendees'),
            'event_frequency': data.get('event_frequency'),
            'website_url': data.get('website_url'),
            'social_media_links': data.get('social_media_links'),
            'portfolio_url': data.get('portfolio_url'),
            'additional_info': data.get('additional_info'),
            'status': 'pending', 
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        # Upsert
        mongo.db.host_applications.update_one(
            {'user_id': ObjectId(current_user['_id'])},
            {'$set': application},
            upsert=True
        )

        return jsonify({'message': 'Application submitted successfully'}), 201

    except Exception as e:
        print(f"Error submitting host application: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

@host_application_bp.route('/me', methods=['GET'])
@token_required
def get_my_application(current_user):
    try:
        app = mongo.db.host_applications.find_one({'user_id': ObjectId(current_user['_id'])})
        if not app:
            return jsonify(None), 200 # Or 404
        
        # Serialize ObjectId
        app['_id'] = str(app['_id'])
        app['user_id'] = str(app['user_id'])
        
        return jsonify(app), 200
    except Exception as e:
        print(f"Error getting application: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
