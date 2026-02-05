from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from bson.objectid import ObjectId
from datetime import datetime

merchandise_bp = Blueprint('merchandise_bp', __name__)

@merchandise_bp.route('', methods=['GET'])
@token_required
def get_merchandise(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # Get merchandise for events created by this organizer
        # 1. Find all events by organizer
        events = list(mongo.db.events.find({"created_by": current_user['_id']}))
        event_ids = [str(e['_id']) for e in events]
        
        # 2. Find merchandise linked to these events or created by organizer
        query = {
            "$or": [
                {"event_id": {"$in": event_ids}},
                {"created_by": current_user['_id']}
            ]
        }
        
        items = list(mongo.db.merchandise.find(query).sort("created_at", -1))
        
        results = []
        for item in items:
            item['id'] = str(item['_id'])
            del item['_id']
            results.append(item)
            
        return jsonify(results), 200
    except Exception as e:
        print(f"Error fetching merchandise: {e}")
        return jsonify({"message": "Error fetching merchandise"}), 500

@merchandise_bp.route('', methods=['POST'])
@token_required
def create_merchandise(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        data = request.json
        required = ['name', 'price', 'stock']
        if not all(k in data for k in required):
            return jsonify({"message": "Missing required fields"}), 400

        new_item = {
            "created_by": current_user['_id'],
            "name": data['name'],
            "description": data.get('description', ''),
            "price": float(data['price']),
            "stock": int(data['stock']),
            "category": data.get('category', 'other'),
            "image": data.get('image'),
            "event_id": data.get('event_id'), # Optional
            "sold": 0,
            "status": data.get('status', 'active'),
            "created_at": datetime.utcnow()
        }
        
        result = mongo.db.merchandise.insert_one(new_item)
        
        return jsonify({
            "message": "Product created",
            "id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Error creating merchandise: {e}")
        return jsonify({"message": "Error creating merchandise"}), 500

@merchandise_bp.route('/<item_id>', methods=['PUT'])
@token_required
def update_merchandise(current_user, item_id):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        data = request.json
        # Only allow updates to owned items
        mongo.db.merchandise.update_one(
            {"_id": ObjectId(item_id), "created_by": current_user['_id']},
            {"$set": {
                "name": data.get('name'),
                "description": data.get('description'),
                "price": float(data.get('price', 0)) if data.get('price') else None,
                "stock": int(data.get('stock', 0)) if data.get('stock') is not None else None,
                "status": data.get('status')
            }}
        )
        return jsonify({"message": "Product updated"}), 200
    except Exception as e:
         print(f"Error update merchandise: {e}")
         return jsonify({"message": "Error updating product"}), 500

@merchandise_bp.route('/<item_id>', methods=['DELETE'])
@token_required
def delete_merchandise(current_user, item_id):
    try:
        mongo.db.merchandise.delete_one({"_id": ObjectId(item_id), "created_by": current_user['_id']})
        return jsonify({"message": "Product deleted"}), 200
    except:
        return jsonify({"message": "Error deleting product"}), 500
