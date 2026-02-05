from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from bson.objectid import ObjectId
from datetime import datetime

event_bp = Blueprint('event_bp', __name__)
public_bp = Blueprint('public_bp', __name__)

# Handle OPTIONS preflight for event creation
@event_bp.route('', methods=['OPTIONS'])
def handle_options():
    return jsonify({}), 200

@event_bp.route('', methods=['POST'], strict_slashes=False)
@token_required
def create_event(current_user):
    try:
        data = request.get_json()
        
        # Minimal required fields for a draft
        title = data.get('title')
        date = data.get('date')
        
        if not title:
            return jsonify({'message': 'Event title is required'}), 400
        
        # Validate end date/time is after start date/time
        start_date = data.get('start_date')
        start_time = data.get('start_time')
        end_date = data.get('end_date')
        end_time = data.get('end_time')
        
        if start_date and end_date and start_time and end_time:
            from dateutil import parser
            try:
                start_dt = parser.parse(f"{start_date} {start_time}")
                end_dt = parser.parse(f"{end_date} {end_time}")
                
                if end_dt <= start_dt:
                    return jsonify({'message': 'Event end date/time must be after start date/time'}), 400
            except:
                pass  # If parsing fails, skip validation

        new_event = {
            "title": title,
            "description": data.get('description', ''),
            "date": date, # Kept for backward compat (Start Date)
            "time": data.get('time', ''), # Kept for backward compat (Start Time)
            "start_date": start_date,
            "start_time": start_time,
            "end_date": end_date,
            "end_time": end_time,
            "location": data.get('location', ''), # address
            "address": data.get('address', ''), # map to location if needed, or keep separate
            "background_image_url": data.get('background_image_url', ''),
            "gallery_images": data.get('gallery_images', []),
            "status": data.get('status', 'draft'), # Use status from request, default to draft
            "capacity": data.get('capacity', 0), # 0 = unlimited
            "timezone": data.get('timezone', 'UTC'),
            "created_by": current_user['_id'], # ObjectId
            "creator_name": current_user.get('name', 'Organizer'),
            "created_at": datetime.utcnow(),
            "target_date": data.get('target_date'), # ISO string or datetime
            "tickets": data.get('tickets', []), # List of ticket objects
            "category": data.get('category', ''),
            "meeting_link": data.get('meeting_link', ''),
            "location_type": data.get('location_type', 'physical'),
            "guests": data.get('guests', []),
            "lineup": data.get('lineup', [])
        }

        result = mongo.db.events.insert_one(new_event)
        
        return jsonify({
            "message": "Event created successfully",
            "id": str(result.inserted_id),
            "status": new_event['status']
        }), 201
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        return jsonify({'message': f'Error creating event: {str(e)}'}), 500

@event_bp.route('/<event_id>', methods=['PUT'])
@token_required
def update_event(current_user, event_id):
    data = request.get_json()
    
    # Verify ownership
    event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        return jsonify({"message": "Event not found"}), 404
        
    if str(event.get('created_by')) != str(current_user['_id']):
        return jsonify({"message": "Unauthorized"}), 403

    update_fields = {
        "title": data.get('title'),
        "description": data.get('description'),
        "date": data.get('date'),
        "time": data.get('time'),
        "start_date": data.get('start_date'),
        "start_time": data.get('start_time'),
        "end_date": data.get('end_date'),
        "end_time": data.get('end_time'),
        "address": data.get('address'),
        "location": data.get('location'),
        "background_image_url": data.get('background_image_url'),
        "gallery_images": data.get('gallery_images'),
        "capacity": data.get('capacity'),
        "timezone": data.get('timezone'),
        "target_date": data.get('target_date'),
        "status": data.get('status'), # Allow publishing via PUT
        "is_featured": data.get('is_featured'),
        "tickets": data.get('tickets')
    }
    
    # Remove None values to avoid overwriting with null
    update_fields = {k: v for k, v in update_fields.items() if v is not None}
    
    mongo.db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": update_fields}
    )
    
    return jsonify({"message": "Event updated successfully"}), 200

@event_bp.route('/<event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"message": "Event not found"}), 404
            
        # Convert ObjectId to string
        event['id'] = str(event['_id'])
        del event['_id']
        
        # Enrich with creator details
        if 'created_by' in event:
            creator_id = event['created_by']
            event['created_by'] = str(creator_id)
            
            try:
                # Fetch creator details
                user = mongo.db.users.find_one({"_id": creator_id})
                if user:
                    # Prioritize organization name for events, fallback to person name
                    org_name = user.get('organization_name')
                    full_name = user.get('name', 'Organizer')
                    
                    event['creator_name'] = org_name if org_name else full_name
                    event['creator_avatar'] = user.get('avatar_url')
                    event['creator_organization'] = org_name
            except Exception as e:
                print(f"Error fetching creator details: {e}")

        return jsonify(event), 200
    except:
        return jsonify({"message": "Invalid event ID"}), 400

@event_bp.route('/', methods=['GET'], strict_slashes=False)
def get_events():
    # Filter by query params
    # e.g. ?created_by=... to show drafts
    # ?limit=...
    
    created_by = request.args.get('created_by')
    limit = int(request.args.get('limit', 20))
    sort_by = request.args.get('sort', '-created_at')
    
    query = {}
    if created_by:
        query['created_by'] = ObjectId(created_by)
    else:
        # Public feed only shows published events
        query['status'] = 'published'

    is_featured = request.args.get('featured')
    if is_featured == 'true':
        query['is_featured'] = True

    print(f"Query: {query}")
    print(f"Database: {mongo.db.name}")
    print(f"Collection: events")
    
    cursor = mongo.db.events.find(query)
    
    # Sorting
    if sort_by.startswith('-'):
        cursor = cursor.sort(sort_by[1:], -1)
    else:
        cursor = cursor.sort(sort_by, 1)
        
    events = []
    for doc in cursor.limit(limit):
        doc['id'] = str(doc['_id'])
        del doc['_id']
        if 'created_by' in doc:
            doc['created_by'] = str(doc['created_by'])
        events.append(doc)
    
    print(f"[EVENTS] Returning {len(events)} events")
    if events:
        print(f"[EVENTS] First event ID: {events[0].get('id')}, Title: {events[0].get('title')}")
        
    return jsonify({"events": events}), 200

# Public Routes (Ticket checking etc) staying mostly same but connected to DB
@public_bp.route('/tickets', methods=['GET'])
def get_event_tickets():
    # Mock tickets for now - will be replaced by DB call later
    return jsonify([
        {"id": "t1", "name": "General Admission", "price": 0, "description": "Free entry"},
        {"id": "t2", "name": "VIP", "price": 50, "description": "VIP Access"}
    ]), 200

@public_bp.route('/registrations/check/<event_id>', methods=['GET'])
def check_registration(event_id):
    # Mock registration check
    return jsonify({"isRegistered": False}), 200
