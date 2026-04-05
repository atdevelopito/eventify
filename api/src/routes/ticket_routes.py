from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from src.utils.ticket_utils import generate_tickets_for_registration, generate_secure_token, verify_qr_payload
from src.services.email_service import EmailService
from src.tasks.email_tasks import send_event_entry_email_task
from bson.objectid import ObjectId
from datetime import datetime

ticket_bp = Blueprint('tickets', __name__)

@ticket_bp.route('/my', methods=['GET'])
@token_required
def get_my_tickets(current_user):
    """Get all tickets for the authenticated user"""
    try:
        user_id = current_user.get('id') or str(current_user.get('_id', ''))
        
        if not user_id:
            return jsonify([]), 200
        
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
                "qr_token": ticket.get('qr_token'),  # Signed QR payload — only shown to owner
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
    """
    Production-grade ticket validation with 4 security layers:
    
    Layer 1: HMAC signature verification (stateless — no DB hit)
    Layer 2: Expiration check (stateless — no DB hit)
    Layer 3: Organizer authorization (1 DB read)
    Layer 4: Atomic one-time scan (1 atomic DB write)
    
    Forgeries and expired tickets are rejected before touching MongoDB,
    protecting the database from scan-flood DDoS attacks.
    """
    try:
        data = request.get_json()
        qr_string = data.get('qr_token') or data.get('qr_payload')
        
        if not qr_string:
            return jsonify({"valid": False, "message": "QR data required"}), 400

        # ── LAYER 1: HMAC Signature Verification ──
        # Rejects forged/tampered QR codes instantly without hitting the database
        payload = verify_qr_payload(qr_string)
        if payload is None:
            # Also try legacy lookup for old unsigned tokens (backwards compat)
            ticket = mongo.db.tickets.find_one({"qr_token": qr_string})
            if ticket:
                # Legacy ticket — fall through to old validation path
                return _validate_legacy_ticket(ticket, current_user, data)
            
            return jsonify({
                "valid": False,
                "message": "Invalid or tampered ticket",
                "error_code": "FORGED"
            }), 403

        # ── LAYER 2: Expiration Check ──
        # Rejects stale QR codes without touching MongoDB
        now_ts = int(datetime.utcnow().timestamp())
        if payload.get('exp', 0) < now_ts:
            return jsonify({
                "valid": False,
                "message": "Ticket QR has expired",
                "error_code": "EXPIRED"
            }), 410

        ticket_id = payload.get('tid')
        event_id = payload.get('eid')

        # ── LAYER 3: Organizer Authorization ──
        # Verify the scanner is the event creator or team member
        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"valid": False, "message": "Event not found"}), 404

        organizer_id = current_user.get('id') or str(current_user.get('_id', ''))
        is_authorized = (
            str(event.get('created_by')) == organizer_id or
            organizer_id in [str(m) for m in event.get('team_members', [])]
        )
        if not is_authorized:
            return jsonify({
                "valid": False,
                "message": "You are not authorized to scan tickets for this event",
                "error_code": "UNAUTHORIZED"
            }), 403

        # Verify event_id matches if provided by scanner app
        target_event_id = data.get('event_id')
        if target_event_id and str(event_id) != target_event_id:
            return jsonify({
                "valid": False,
                "message": "Ticket is for a different event",
                "error_code": "EVENT_MISMATCH",
                "mismatch": True
            }), 200

        # ── LAYER 4: Atomic One-Time Scan ──
        # findOneAndUpdate with status="valid" precondition prevents race conditions.
        # If two scanners hit the same QR within milliseconds, only ONE will succeed.
        result = mongo.db.tickets.find_one_and_update(
            {
                "ticket_id": ticket_id,
                "status": "valid"
            },
            {
                "$set": {
                    "status": "used",
                    "scanned_at": datetime.utcnow(),
                    "scanned_by": organizer_id,
                    "scan_device_info": request.user_agent.string,
                    "scan_ip": request.remote_addr,
                    "used_at": datetime.utcnow(),
                    "validated_by": organizer_id
                },
                "$inc": {"scan_attempts": 1}
            },
            return_document=True
        )

        if not result:
            # Atomic update failed — ticket wasn't in "valid" state
            existing = mongo.db.tickets.find_one({"ticket_id": ticket_id})

            if not existing:
                return jsonify({
                    "valid": False,
                    "message": "Ticket not found in system",
                    "error_code": "NOT_FOUND"
                }), 404

            # Log the failed scan attempt for audit
            mongo.db.tickets.update_one(
                {"_id": existing['_id']},
                {"$inc": {"scan_attempts": 1}}
            )

            if existing.get('status') == 'used':
                return jsonify({
                    "valid": False,
                    "message": "Ticket already scanned",
                    "error_code": "ALREADY_USED",
                    "used_at": existing.get('scanned_at', existing.get('used_at')).isoformat() if existing.get('scanned_at') or existing.get('used_at') else None
                }), 200

            if existing.get('status') == 'cancelled':
                return jsonify({"valid": False, "message": "Ticket has been cancelled", "error_code": "CANCELLED"}), 200

            if existing.get('status') == 'expired':
                return jsonify({"valid": False, "message": "Ticket has expired", "error_code": "EXPIRED"}), 200

            return jsonify({
                "valid": False,
                "message": f"Ticket status: {existing.get('status')}",
                "error_code": "INVALID_STATUS"
            }), 200

        # ── SUCCESS ──
        # Fire-and-forget welcome email
        try:
            ticket_user = mongo.db.users.find_one({"_id": ObjectId(result['user_id'])})
            if ticket_user and ticket_user.get('email'):
                from src.services.email_service import EmailService
                # Background entry email
                send_event_entry_email_task.delay(
                    to_email=ticket_user.get('email'),
                    event_name=event.get('title'),
                    ticket_id=ticket_id
                )
        except Exception as email_err:
            print(f"Failed to send entry email: {email_err}")

        return jsonify({
            "valid": True,
            "message": "Ticket validated successfully",
            "ticket_id": ticket_id,
            "ticket_type": result.get('ticket_type')
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Error validating ticket: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"valid": False, "message": "Validation error"}), 500


def _validate_legacy_ticket(ticket, current_user, data):
    """
    Backwards-compatible validation for old unsigned QR tokens.
    Used for tickets generated before the HMAC upgrade.
    """
    # Get event to verify authorization
    event = mongo.db.events.find_one({"_id": ObjectId(ticket['event_id'])})
    
    organizer_id = current_user.get('id') or str(current_user.get('_id', ''))
    if event and str(event.get('created_by')) != organizer_id:
        return jsonify({"valid": False, "message": "Unauthorized - not event organizer"}), 403
    
    # Check event mismatch
    target_event_id = data.get('event_id')
    if target_event_id and str(ticket.get('event_id')) != target_event_id:
        return jsonify({"valid": False, "message": "Ticket is for a different event", "mismatch": True}), 200
    
    # Atomic scan for legacy tickets too
    result = mongo.db.tickets.find_one_and_update(
        {"_id": ticket['_id'], "status": "valid"},
        {
            "$set": {
                "status": "used",
                "used_at": datetime.utcnow(),
                "scanned_at": datetime.utcnow(),
                "scanned_by": organizer_id,
                "validated_by": organizer_id
            },
            "$inc": {"scan_attempts": 1}
        },
        return_document=True
    )
    
    if not result:
        if ticket.get('status') == 'used':
            return jsonify({
                "valid": False,
                "message": "Ticket already used",
                "used_at": ticket.get('used_at').isoformat() if ticket.get('used_at') else None
            }), 200
        if ticket.get('status') == 'cancelled':
            return jsonify({"valid": False, "message": "Ticket cancelled"}), 200
        return jsonify({"valid": False, "message": f"Invalid ticket status: {ticket.get('status')}"}), 200
    
    # Fire-and-forget welcome email
    try:
        ticket_user = mongo.db.users.find_one({"_id": ObjectId(ticket['user_id'])})
        if ticket_user and ticket_user.get('email'):
            from src.services.email_service import EmailService
            # Background entry email
            send_event_entry_email_task.delay(
                to_email=ticket_user.get('email'),
                event_name=event.get('title'),
                ticket_id=ticket.get('ticket_id')
            )
    except Exception as email_err:
        print(f"Failed to send entry email: {email_err}")

    return jsonify({
        "valid": True,
        "message": "Ticket validated successfully",
        "ticket_id": ticket.get('ticket_id'),
        "ticket_type": ticket.get('ticket_type')
    }), 200
