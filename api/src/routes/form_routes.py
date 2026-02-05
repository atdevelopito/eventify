from flask import Blueprint, request, jsonify
from src.database import mongo
from src.utils.decorators import token_required
from bson.objectid import ObjectId
from datetime import datetime

form_bp = Blueprint('form_bp', __name__)

@form_bp.route('', methods=['POST'])
@token_required
def create_form(current_user):
    try:
        data = request.get_json()
        title = data.get('title')
        fields = data.get('fields', []) # Array of {id, type, label, required, options}
        
        if not title:
            return jsonify({"message": "Form title is required"}), 400
            
        new_form = {
            "organizer_id": current_user['_id'],
            "title": title,
            "fields": fields,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = mongo.db.forms.insert_one(new_form)
        
        return jsonify({
            "message": "Form created successfully",
            "id": str(result.inserted_id)
        }), 201
    except Exception as e:
        print(f"Error creating form: {e}")
        return jsonify({"message": "Error creating form"}), 500

@form_bp.route('/organizer', methods=['GET'])
@token_required
def get_organizer_forms(current_user):
    try:
        forms = list(mongo.db.forms.find({"organizer_id": current_user['_id']}))
        
        results = []
        for form in forms:
            form['id'] = str(form['_id'])
            del form['_id']
            # Convert ObjectId to str for organizer_id if needed, though usually we just delete/ignore it in response if not needed
            if 'organizer_id' in form:
                form['organizer_id'] = str(form['organizer_id'])
            results.append(form)
            
        return jsonify(results), 200
    except Exception as e:
        print(f"Error fetching forms: {e}")
        return jsonify({"message": "Error fetching forms"}), 500

@form_bp.route('/<form_id>', methods=['GET'])
def get_form(form_id):
    try:
        form = mongo.db.forms.find_one({"_id": ObjectId(form_id)})
        if not form:
            return jsonify({"message": "Form not found"}), 404
            
        form['id'] = str(form['_id'])
        del form['_id']
        form['organizer_id'] = str(form['organizer_id'])
        
        return jsonify(form), 200
    except Exception as e:
        print(f"Error fetching form: {e}")
        return jsonify({"message": "Error fetching form"}), 500

@form_bp.route('/<form_id>', methods=['PUT'])
@token_required
def update_form(current_user, form_id):
    try:
        data = request.get_json()
        
        # Verify ownership
        form = mongo.db.forms.find_one({
            "_id": ObjectId(form_id),
            "organizer_id": current_user['_id']
        })
        
        if not form:
            return jsonify({"message": "Form not found or unauthorized"}), 404
            
        update_data = {
            "updated_at": datetime.utcnow()
        }
        
        if 'title' in data:
            update_data['title'] = data['title']
        if 'fields' in data:
            update_data['fields'] = data['fields']
            
        mongo.db.forms.update_one(
            {"_id": ObjectId(form_id)},
            {"$set": update_data}
        )
        
        return jsonify({"message": "Form updated successfully"}), 200
    except Exception as e:
        print(f"Error updating form: {e}")
        return jsonify({"message": "Error updating form"}), 500

@form_bp.route('/<form_id>', methods=['DELETE'])
@token_required
def delete_form(current_user, form_id):
    try:
        result = mongo.db.forms.delete_one({
            "_id": ObjectId(form_id),
            "organizer_id": current_user['_id']
        })
        
        if result.deleted_count == 0:
            return jsonify({"message": "Form not found or unauthorized"}), 404
            
        return jsonify({"message": "Form deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting form: {e}")
        return jsonify({"message": "Error deleting form"}), 500
