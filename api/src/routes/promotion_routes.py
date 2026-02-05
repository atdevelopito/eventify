from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from bson.objectid import ObjectId
from datetime import datetime

promotion_bp = Blueprint('promotion_bp', __name__)

@promotion_bp.route('', methods=['GET'])
@token_required
def get_promotions(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # Get promotions for events created by this organizer
        # 1. Find all events by organizer
        events = list(mongo.db.events.find({"created_by": current_user['_id']}))
        event_ids = [e['_id'] for e in events]
        str_event_ids = [str(e['_id']) for e in events]
        
        # 2. Find promotions linked to these events
        query = {
            "$or": [
                {"event_id": {"$in": event_ids}},
                {"event_id": {"$in": str_event_ids}},
                {"created_by": current_user['_id']} # Also those explicitly created by user
            ]
        }
        
        promotions = list(mongo.db.promotions.find(query).sort("created_at", -1))
        
        results = []
        for promo in promotions:
           promo['id'] = str(promo['_id'])
           del promo['_id']
           
           # Resolve Event Title
           event_id = promo.get('event_id')
           event_title = "Global / All Events"
           if event_id:
               # Simple lookup in our pre-fetched list
               matched = next((e for e in events if str(e['_id']) == str(event_id)), None)
               if matched:
                   event_title = matched.get('title')
           
           promo['event_title'] = event_title
           results.append(promo)
           
        return jsonify(results), 200
    except Exception as e:
        print(f"Error fetching promotions: {e}")
        return jsonify({"message": "Error fetching promotions"}), 500

@promotion_bp.route('', methods=['POST'])
@token_required
def create_promotion(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        data = request.json
        
        required = ['code', 'type', 'amount']
        if not all(k in data for k in required):
            return jsonify({"message": "Missing required fields"}), 400
            
        # Check uniqueness of code (globally or per event? usually per event or global uniqueness is safer)
        # For now, enforce unique code per organizer
        existing = mongo.db.promotions.find_one({
            "code": data['code'],
            "created_by": current_user['_id']
        })
        if existing:
            return jsonify({"message": "Promo code already exists"}), 400

        new_promo = {
            "created_by": current_user['_id'],
            "code": data['code'].upper(),
            "type": data['type'], # 'percentage' or 'fixed'
            "amount": float(data['amount']),
            "event_id": data.get('event_id'), # Optional, none means global
            "description": data.get('description', ''),
            "usage_limit": int(data.get('usage_limit', 0)), # 0 = unlimited
            "used_count": 0,
            "expiry_date": data.get('expiry_date'), # ISO String
            "status": data.get('status', 'active'),
            "created_at": datetime.utcnow()
        }
        
        result = mongo.db.promotions.insert_one(new_promo)
        
        return jsonify({
            "message": "Promotion created",
            "id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Error creating promotion: {e}")
        return jsonify({"message": "Error creating promotion"}), 500

@promotion_bp.route('/<promo_id>', methods=['PUT'])
@token_required
def update_promotion(current_user, promo_id):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        data = request.json
        mongo.db.promotions.update_one(
            {"_id": ObjectId(promo_id), "created_by": current_user['_id']},
            {"$set": {
                "status": data.get('status'),
                "usage_limit": data.get('usage_limit')
            }}
        )
        return jsonify({"message": "Promotion updated"}), 200
    except Exception as e:
        return jsonify({"message": "Error updating promotion"}), 500

@promotion_bp.route('/<promo_id>', methods=['DELETE'])
@token_required
def delete_promotion(current_user, promo_id):
    try:
        mongo.db.promotions.delete_one({"_id": ObjectId(promo_id)})
        return jsonify({"message": "Promotion deleted"}), 200
    except Exception as e:
        print(f"Error deleting promotion: {e}")
        return jsonify({"message": "Error deleting promotion"}), 500
