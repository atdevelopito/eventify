from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from src.utils.ticket_utils import generate_tickets_for_registration, generate_secure_token
from bson.objectid import ObjectId
from datetime import datetime

ticket_bp = Blueprint('tickets', __name__)

@ticket_bp.route('/my', methods=['GET'])
@token_required
def get_my_tickets(current_user):
    """Get all tickets for the authenticated user"""
    try:
        # Get user_id from current_user (auth returns 'id')
        user_id = current_user.get('id') or str(current_user.get('_id', ''))
        
        if not user_id:
            return jsonify([]), 200
        
        # Find all tickets for this user
        tickets = list(mongo.db.tickets.find({"user_id": user_id}))
        
        result = []
        for ticket in tickets:
            # Get event details
            event_id = ticket.get('event_id')
            event = None
            if event_id:
                try:
                    event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
                except:
                    pass
                if not event:
                    event = mongo.db.events.find_one({"_id": str(event_id)})
            
            # Get registration details
            reg_id = ticket.get('registration_id')
            registration = None
            if reg_id:
                try:
                    registration = mongo.db.registrations.find_one({"_id": ObjectId(reg_id)})
                except:
                    pass
                if not registration:
                     registration = mongo.db.registrations.find_one({"_id": str(reg_id)})
            
            ticket_data = {
                "id": str(ticket['_id']),
                "ticket_id": ticket.get('ticket_id'),
                "status": ticket.get('status'),
                "ticket_type": ticket.get('ticket_type'),
                "created_at": ticket.get('created_at').isoformat() if ticket.get('created_at') else None,
                "used_at": ticket.get('used_at').isoformat() if ticket.get('used_at') else None,
                "qr_token": ticket.get('qr_token'),  # Only show to owner
                "event": {
                    "id": str(event['_id']) if event else None,
                    "title": event.get('title') if event else 'Unknown Event',
                    "date": event.get('date') or event.get('start_date') if event else 'TBA',
                    "time": event.get('time', '') or event.get('start_time', '') if event else 'TBA',
                    "address": event.get('address', '') or event.get('venue', '') or event.get('city', '') if event else 'TBA',
                    "background_image_url": event.get('cover_image') or event.get('background_image_url', '') if event else '',
                    "target_date": event.get('target_date') or event.get('start_date') if event else None
                } if event else None,
                "registration": {
                    "payment_status": registration.get('payment_status') if registration else 'unknown',
                    "registered_at": registration.get('registered_at').isoformat() if registration and registration.get('registered_at') else None
                } if registration else None
            }
            
            result.append(ticket_data)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"[ERROR] Error fetching tickets: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify([]), 200

@ticket_bp.route('/<ticket_id>', methods=['GET'])
@token_required
def get_ticket_details(current_user, ticket_id):
    """Get details for a specific ticket"""
    try:
        user_id = current_user.get('id') or str(current_user.get('_id', ''))
        
        # Find ticket
        ticket = mongo.db.tickets.find_one({"_id": ObjectId(ticket_id)})
        
        if not ticket:
            return jsonify({"message": "Ticket not found"}), 404
        
        # Verify ownership
        if ticket.get('user_id') != user_id:
            return jsonify({"message": "Unauthorized"}), 403
        
        # Get event details
        event = mongo.db.events.find_one({"_id": ObjectId(ticket['event_id'])})
        
        # Get user details
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        
        ticket_data = {
            "id": str(ticket['_id']),
            "ticket_id": ticket.get('ticket_id'),
            "status": ticket.get('status'),
            "ticket_type": ticket.get('ticket_type'),
            "qr_token": ticket.get('qr_token'),
            "created_at": ticket.get('created_at').isoformat() if ticket.get('created_at') else None,
            "used_at": ticket.get('used_at').isoformat() if ticket.get('used_at') else None,
            "event": {
                "id": str(event['_id']) if event else None,
                "title": event.get('title') if event else 'Unknown Event',
                "date": event.get('date') or event.get('start_date') if event else 'TBA',
                "time": event.get('time', '') or event.get('start_time', '') if event else 'TBA',
                "address": event.get('address', '') or event.get('venue', '') or event.get('city', '') if event else 'TBA',
                "background_image_url": event.get('cover_image') or event.get('background_image_url', '') if event else '',
                "description": event.get('description') if event else ''
            } if event else None,
            "holder": {
                "name": user.get('name') if user else 'Unknown',
                "email": user.get('email') if user else 'Unknown'
            } if user else None
        }
        
        return jsonify(ticket_data), 200
        
    except Exception as e:
        print(f"[ERROR] Error fetching ticket details: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"message": "Error fetching ticket"}), 500

@ticket_bp.route('/validate', methods=['POST'])
@token_required
def validate_ticket(current_user):
    """Validate a ticket by QR token (organizer only)"""
    try:
        data = request.get_json()
        qr_token = data.get('qr_token')
        
        if not qr_token:
            return jsonify({"valid": False, "message": "QR token required"}), 400
        
        # Find ticket by QR token
        ticket = mongo.db.tickets.find_one({"qr_token": qr_token})
        
        if not ticket:
            return jsonify({"valid": False, "message": "Invalid ticket"}), 404
        
        # Get event to verify authorization FIRST (security)
        event = mongo.db.events.find_one({"_id": ObjectId(ticket['event_id'])})
        
        # Verify current user is organizer of this event BEFORE revealing ticket status
        organizer_id = current_user.get('id') or str(current_user.get('_id', ''))
        if event and str(event.get('created_by')) != organizer_id:
            return jsonify({"valid": False, "message": "Unauthorized - not event organizer"}), 403
            
        # Verify ticket belongs to the selected event (if event_id provided)
        target_event_id = data.get('event_id')
        if target_event_id and str(ticket.get('event_id')) != target_event_id:
             return jsonify({
                 "valid": False, 
                 "message": "Ticket is for a different event",
                 "mismatch": True
             }), 200
        
        # NOW check ticket status (only after authorization)
        if ticket.get('status') == 'used':
            return jsonify({
                "valid": False,
                "message": "Ticket already used",
                "used_at": ticket.get('used_at').isoformat() if ticket.get('used_at') else None
            }), 200
        
        # Check if cancelled
        if ticket.get('status') == 'cancelled':
            return jsonify({"valid": False, "message": "Ticket cancelled"}), 200
        
        # Mark ticket as used
        mongo.db.tickets.update_one(
            {"_id": ticket['_id']},
            {
                "$set": {
                    "status": "used",
                    "used_at": datetime.utcnow(),
                    "validated_by": current_user.get('id')
                }
            }
        )
        
        # Send Welcome Email (Fire and forget, don't block response)
        try:
            # Need to get user email. Ticket has user_id.
            ticket_user = mongo.db.users.find_one({"_id": ObjectId(ticket['user_id'])})
            if ticket_user and ticket_user.get('email'):
                from src.services.email_service import EmailService
                EmailService.send_event_entry_email(
                    ticket_user.get('email'), 
                    event.get('title', 'the event'), 
                    ticket.get('ticket_id')
                )
        except Exception as email_err:
            print(f"Failed to send entry email: {email_err}")

        return jsonify({
            "valid": True,
            "message": "Ticket validated successfully",
            "ticket_id": ticket.get('ticket_id'),
            "ticket_type": ticket.get('ticket_type')
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Error validating ticket: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"valid": False, "message": "Validation error"}), 500
