from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from bson.objectid import ObjectId
from datetime import datetime

team_bp = Blueprint('team_bp', __name__)

@team_bp.route('', methods=['GET'])
@token_required
def get_team(current_user):
    try:
        # Find team document for this organizer
        team = mongo.db.teams.find_one({"organizer_id": current_user['_id']})
        
        if not team:
            return jsonify([]), 200
            
        return jsonify(team.get('members', [])), 200
    except Exception as e:
        print(f"Error fetching team: {e}")
        return jsonify({"message": "Error fetching team"}), 500

@team_bp.route('', methods=['POST'])
@token_required
def add_team_member(current_user):
    try:
        data = request.json
        email = data.get('email')
        role = data.get('role', 'Collaborator')
        
        if not email:
            return jsonify({"message": "Email is required"}), 400
            
        # Check if user exists
        user = mongo.db.users.find_one({"email": email})
        
        member_entry = {
            "email": email,
            "role": role,
            "status": "active" if user else "pending", # If user exists, active immediately for simplicity
            "invited_at": datetime.utcnow(),
            "user_id": str(user['_id']) if user else None
        }
        
        # Upsert team document
        mongo.db.teams.update_one(
            {"organizer_id": current_user['_id']},
            {"$push": {"members": member_entry}},
            upsert=True
        )
        
        return jsonify({"message": "Team member invited", "member": member_entry}), 201
        
    except Exception as e:
        print(f"Error adding team member: {e}")
        return jsonify({"message": "Error adding team member"}), 500

@team_bp.route('/<email>', methods=['DELETE'])
@token_required
def remove_team_member(current_user, email):
    try:
        mongo.db.teams.update_one(
            {"organizer_id": current_user['_id']},
            {"$pull": {"members": {"email": email}}}
        )
        return jsonify({"message": "Team member removed"}), 200
    except Exception as e:
        print(f"Error removing team member: {e}")
        return jsonify({"message": "Error removing team member"}), 500
