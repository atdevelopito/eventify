from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from bson.objectid import ObjectId
from datetime import datetime

follow_bp = Blueprint('follow_bp', __name__)

@follow_bp.route('/check/<target_id>', methods=['GET'])
@token_required
def check_follow_status(current_user, target_id):
    try:
        # distinct "follows" collection or embedded array?
        # Assuming a separate collection for scalability as implied by "api/follows" structure
        
        existing_follow = mongo.db.follows.find_one({
            "follower_id": current_user['_id'],
            "followed_id": ObjectId(target_id)
        })
        
        is_following = True if existing_follow else False
        
        return jsonify({
            "isFollowing": is_following
        }), 200

    except Exception as e:
        print(f"Error checking follow status: {e}")
        return jsonify({"message": "Error checking follow status", "isFollowing": False}), 500

@follow_bp.route('/check/<target_id>', methods=['POST'])
@token_required
def toggle_follow(current_user, target_id):
    try:
        target_oid = ObjectId(target_id)
        
        existing_follow = mongo.db.follows.find_one({
            "follower_id": current_user['_id'],
            "followed_id": target_oid
        })
        
        if existing_follow:
            # Unfollow
            mongo.db.follows.delete_one({"_id": existing_follow['_id']})
            is_following = False
            message = "Unfollowed successfully"
        else:
            # Follow
            new_follow = {
                "follower_id": current_user['_id'],
                "followed_id": target_oid,
                "created_at": datetime.utcnow()
            }
            mongo.db.follows.insert_one(new_follow)
            is_following = True
            message = "Followed successfully"
            
        return jsonify({
            "message": message,
            "isFollowing": is_following
        }), 200

    except Exception as e:
        print(f"Error toggling follow: {e}")
        return jsonify({"message": "Error processing request"}), 500

@follow_bp.route('/count/<target_id>', methods=['GET'])
def get_follower_count(target_id):
    try:
        count = mongo.db.follows.count_documents({"followed_id": ObjectId(target_id)})
        return jsonify({"count": count}), 200
    except Exception as e:
        print(f"Error fetching follower count: {e}")
        return jsonify({"message": "Error fetching follower count", "count": 0}), 500
