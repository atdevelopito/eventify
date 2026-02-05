from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from bson.objectid import ObjectId
from datetime import datetime

registration_bp = Blueprint('registration_bp', __name__)

@registration_bp.route('/event/<event_id>', methods=['GET'])
@token_required
def get_event_registrations(current_user, event_id):
    try:
        # Verify ownership: Only event creator can see registrations
        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"message": "Event not found"}), 404
            
        # Security Check: Ensure current user is the creator
        if str(event.get('created_by')) != str(current_user['_id']):
            return jsonify({"message": "Unauthorized"}), 403

        registrations = list(mongo.db.registrations.find({"event_id": ObjectId(event_id)}))
        # Fallback for string IDs if any exist
        if not registrations:
             registrations = list(mongo.db.registrations.find({"event_id": event_id}))

        results = []
        for reg in registrations:
            # Populate user details
            reg_user = None
            if reg.get('user_id'):
                try:
                    reg_user = mongo.db.users.find_one({"_id": ObjectId(reg['user_id'])})
                except:
                    pass
            
            reg['id'] = str(reg['_id'])
            del reg['_id']
            
            # Enrich with User Info
            if reg_user:
                reg['user_name'] = reg_user.get('name', 'Unknown')
                reg['user_email'] = reg_user.get('email', '')
            else:
                reg['user_name'] = reg.get('guest_name', 'Anonymous')
                reg['user_email'] = reg.get('guest_email', '')

            # Ensure we return relevant ticket fields
            reg['ticket_type'] = reg.get('ticket_type', 'General')
            reg['quantity'] = reg.get('quantity', 1)
            reg['price'] = reg.get('price', 0)
            reg['status'] = reg.get('status', 'confirmed')
            reg['payment_status'] = reg.get('payment_status', 'paid')

            results.append(reg)
            
        return jsonify(results), 200
    except Exception as e:
        print(f"Error fetching registrations: {e}")
        return jsonify({"message": "Error fetching registrations"}), 500

@registration_bp.route('', methods=['POST'])
def create_registration():
    try:
        data = request.get_json()
        
        # Check for Authentication (Optional)
        current_user = None
        user_id = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                from src.utils.security import Security
                from src.models.user_model import User
                
                decoded_user_id = Security.verify_token(token)
                if decoded_user_id:
                     current_user = User.find_by_id(decoded_user_id)
                     if current_user:
                         user_id = current_user.get('id') or str(current_user.get('_id', ''))

        event_id = data.get('event_id')
        ticket_type = data.get('ticket_type', 'General')
        price = data.get('price', 0)
        quantity = data.get('quantity', 1)
        payment_method = data.get('payment_method', 'Card') # Default to Card
        
        if not event_id:
            return jsonify({"message": "Event ID required"}), 400
        
        # Guest Details
        guest_name = data.get('guest_name')
        guest_email = data.get('guest_email')
        guest_phone = data.get('guest_phone')
        
        if not user_id:
            # If guest, require minimal details
            if not guest_email or not guest_name:
                 return jsonify({"message": "Guest Name and Email required"}), 400
            user_id = "guest" # Use a marker for guest to satisfy schema if needed, or None if allowed. 
            # I'll use "guest" as a string to be safe with existing logic that might expect a string.
            # But better: store minimal details directly.

            
        form_data = data.get('form_data', [])
        
        # Security: Force pending state for paid tickets
        # Only free tickets can be automatically confirmed
        is_free = price == 0
        initial_status = "confirmed" if is_free else "pending"
        initial_payment_status = "paid" if is_free else "pending"
        
        new_reg = {
            "user_id": user_id,
            "event_id": event_id,
            "ticket_type": ticket_type,
            "price": price,
            "quantity": quantity,
            "payment_method": payment_method,
            "status": initial_status,
            "payment_status": initial_payment_status,
            "registered_at": datetime.utcnow(),
            "form_data": form_data if isinstance(form_data, list) else [form_data] if form_data else [],
            # Guest Fields
            "guest_name": guest_name,
            "guest_email": guest_email,
            "guest_phone": guest_phone
        }
        
        result = mongo.db.registrations.insert_one(new_reg)
        registration_id = str(result.inserted_id)
        
        ticket_ids = []
        # Auto-generate tickets ONLY if it's free/confirmed immediately
        if is_free:
            from src.utils.ticket_utils import generate_tickets_for_registration
            ticket_ids = generate_tickets_for_registration(
                registration_id=registration_id,
                user_id=user_id,
                event_id=event_id,
                quantity=quantity,
                ticket_type=ticket_type
            )
        
        return jsonify({
            "message": "Registration created",
            "id": registration_id,
            "status": initial_status,
            "payment_status": initial_payment_status,
            "tickets": ticket_ids
        }), 201
        
    except Exception as e:
        print(f"Error creating registration: {e}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"message": "Error registering"}), 500

@registration_bp.route('/<registration_id>/confirm_payment', methods=['POST'])
def confirm_payment(registration_id):
    try:
        # Check for Authentication (Manual/Optional)
        current_user = None
        if 'Authorization' in request.headers:
            try:
                auth_header = request.headers['Authorization']
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    from src.utils.security import Security
                    from src.models.user_model import User
                    
                    user_id = Security.verify_token(token)
                    if user_id:
                         current_user = User.find_by_id(user_id)
            except Exception as auth_err:
                print(f"Auth check failed (non-fatal for guests): {auth_err}")

        # 1. Find the registration
        reg = mongo.db.registrations.find_one({"_id": ObjectId(registration_id)})
        if not reg:
            return jsonify({"message": "Registration not found"}), 404
            
        # 2. Verify ownership (security check)
        reg_user_id = str(reg.get('user_id'))
        
        # Allow if guest or if user matches
        is_authorized = False
        
        if reg_user_id == "guest" or reg_user_id == "None":
            is_authorized = True
        elif current_user:
             current_user_id = current_user.get('id') or str(current_user.get('_id', ''))
             if reg_user_id == current_user_id:
                 is_authorized = True
                 
        if not is_authorized:
             return jsonify({"message": "Unauthorized"}), 403

        # 3. Check if already confirmed (Idempotency)
        if reg.get('status') == 'confirmed':
             # Find existing tickets for this registration
             existing_tickets = list(mongo.db.tickets.find({"registration_id": str(registration_id)}))
             ticket_ids = [str(t['_id']) for t in existing_tickets]
             
             return jsonify({
                "message": "Payment already confirmed",
                "status": "confirmed",
                "tickets": ticket_ids
            }), 200

        # 4. Update status to paid/confirmed
        mongo.db.registrations.update_one(
            {"_id": ObjectId(registration_id)},
            {"$set": {
                "status": "confirmed",
                "payment_status": "paid", 
                "paid_at": datetime.utcnow()
            }}
        )
        
        # 5. Generate Tickets NOW
        from src.utils.ticket_utils import generate_tickets_for_registration
        ticket_ids = generate_tickets_for_registration(
            registration_id=registration_id,
            user_id=str(reg.get('user_id')),
            event_id=str(reg.get('event_id')),
            quantity=reg.get('quantity', 1),
            ticket_type=reg.get('ticket_type', 'General')
        )
        
        return jsonify({
            "message": "Payment confirmed and tickets generated",
            "status": "confirmed",
            "tickets": ticket_ids
        }), 200

    except Exception as e:
        print(f"Error confirming payment: {e}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"message": "Error confirming payment"}), 500

from flask_cors import cross_origin

@registration_bp.route('/my', methods=['GET'])
@token_required
def get_my_registrations(current_user):
    print("[DEBUG] ===== get_my_registrations called =====")
    print(f"[DEBUG] current_user type: {type(current_user)}")
    print(f"[DEBUG] current_user keys: {current_user.keys() if isinstance(current_user, dict) else 'Not a dict'}")
    try:
        # CRITICAL FIX: Auth returns 'id' not '_id'
        user_id = current_user.get('id') or str(current_user.get('_id', ''))
        
        if not user_id:
            print("[ERROR] No user_id in current_user")
            return jsonify([]), 200  # Return empty array instead of error
        
        print(f"[DEBUG] Fetching registrations for user_id: {user_id} (type: {type(user_id)})")
        
        # Database stores user_id as STRING, so query with string
        query = {"user_id": user_id}
        print(f"[DEBUG] Registration Query: {query}")
        
        registrations = list(mongo.db.registrations.find(query))
        
        print(f"[DEBUG] Found {len(registrations)} registrations")
        
        results = []
        for reg in registrations:
            try:
                # Populate event details
                event_id = reg.get('event_id')
                event = None
                
                if event_id:
                    try:
                        # Try lookup as ObjectId (most common)
                        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
                        
                        # If not found, try as string (legacy data?)
                        if not event:
                             event = mongo.db.events.find_one({"_id": str(event_id)})
                             
                    except Exception as e:
                        print(f"[ERROR] Error looking up event {event_id}: {e}")
                        # Try lookup as string directly if ObjectId conversion failed
                        try:
                            event = mongo.db.events.find_one({"_id": str(event_id)})
                        except:
                            pass
                
                reg['id'] = str(reg['_id'])
                del reg['_id']
                
                # Ensure registered_at is string for frontend
                if 'registered_at' in reg and isinstance(reg['registered_at'], datetime):
                    reg['registered_at'] = reg['registered_at'].isoformat()
                elif 'registered_at' not in reg:
                    reg['registered_at'] = datetime.utcnow().isoformat()
                
                if event:
                    reg['event'] = {
                        'id': str(event['_id']),
                        'title': event.get('title', 'Untitled Event'),
                        'date': event.get('date') or event.get('start_date') or 'TBA',
                        'time': event.get('time', '') or event.get('start_time', '') or 'TBA',
                        'address': event.get('address', '') or event.get('venue', '') or event.get('city', '') or 'TBA',
                        'background_image_url': event.get('cover_image') or event.get('background_image_url', ''),
                        'target_date': event.get('target_date') or event.get('start_date') or datetime.utcnow().isoformat()
                    }
                else:
                     # Even if event is missing (deleted?), return the registration so user sees it
                     # Use placeholder data
                     reg['event'] = {
                        'id': str(event_id) if event_id else 'unknown',
                        'title': 'Unknown Event (Deleted)',
                        'date': 'N/A',
                        'time': '',
                        'address': '',
                        'background_image_url': '',
                        'target_date': datetime.utcnow().isoformat()
                    }

                results.append(reg)
            except Exception as e:
                print(f"[ERROR] Error processing registration {reg.get('_id')}: {e}")
                import traceback
                print(f"[ERROR] Traceback: {traceback.format_exc()}")
                # Skip this registration and continue
                continue
            
        return jsonify(results), 200
    except Exception as e:
        import traceback
        print(f"[ERROR] Error in get_my_registrations: {str(e)}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        # NEVER crash the My Tickets page - return empty array
        return jsonify([]), 200
