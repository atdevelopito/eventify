"""
AI Routes: Endpoints for generating event descriptions and getting recommendations.
"""
from flask import Blueprint, request, jsonify
from src.services.ai_service import AIService
from src.utils.decorators import token_required
from src.utils.limiter import limiter

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate-description', methods=['POST'])
@token_required
@limiter.limit("5 per minute")
def generate_event_description(current_user):
    """
    Endpoint for organizers to generate a professional event description.
    Body: { "title": "...", "category": "...", "details": "..." }
    """
    data = request.get_json()
    title = data.get('title')
    category = data.get('category')
    details = data.get('details', '')
    
    if not title or not category:
        return jsonify({"message": "Title and Category are required to generate description."}), 400
        
    result, error = AIService.generate_description(title, category, details)
    if error:
        return jsonify({"message": error}), 500
        
    return jsonify({
        "description": result,
        "model": "OpenRouter-Mistral-Free"
    }), 200

@ai_bp.route('/recommendations', methods=['POST'])
@token_required
@limiter.limit("5 per minute")
def get_user_recommendations(current_user):
    """
    Endpoint for users to get event suggestions based on interests.
    Body: { "interests": ["...", "..."] }
    """
    data = request.get_json()
    interests = data.get('interests', [])
    
    if not interests:
        return jsonify({"message": "At least one interest is required for recommendations."}), 400
        
    result, error = AIService.get_event_suggestions(interests)
    if error:
        return jsonify({"message": error}), 500
        
    # Assuming result is a simple list of 3 strings separated by commas or lines
    suggestions = result.split('\n')
    
    return jsonify({
        "suggestions": suggestions,
        "interests_analyzed": interests
    }), 200

@ai_bp.route('/parse-event', methods=['POST'])
@token_required
@limiter.limit("5 per minute")
def parse_event(current_user):
    """
    Endpoint for organizers to generate a full event schema from a prompt.
    Body: { "prompt": "..." }
    """
    data = request.get_json()
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"message": "Prompt is required."}), 400
        
    result, error = AIService.parse_event_prompt(prompt)
    if error:
        return jsonify({"message": error}), 500
        
    return jsonify({
        "event_data": result,
        "model": "OpenRouter-Mistral-Free"
    }), 200
