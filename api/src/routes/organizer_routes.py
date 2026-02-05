from flask import Blueprint, jsonify, request
from src.database import mongo
from src.utils.decorators import token_required
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import calendar

organizer_bp = Blueprint('organizer_bp', __name__)

@organizer_bp.route('/events', methods=['GET'])
@token_required
def get_organizer_events(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # Get events created by this organizer
        query = {"$or": [
            {"created_by": current_user['_id']},
            {"created_by": str(current_user['_id'])}
        ]}
        events = list(mongo.db.events.find(query).sort("created_at", -1))
        
        results = []
        for event in events:
            event_id = str(event['_id'])
            
            # Calculate stats for this event
            registrations = list(mongo.db.registrations.find({"event_id": event_id}))
            tickets_sold = sum(reg.get('quantity', 1) for reg in registrations)
            revenue = sum(reg.get('price', 0) for reg in registrations)
            
            # Helper to safely serialize ObjectId
            event_data = {k: str(v) if isinstance(v, ObjectId) else v for k, v in event.items()}
            event_data['id'] = event_id
            if '_id' in event_data:
                del event_data['_id']
                
            # Add stats
            event_data['ticketsSold'] = tickets_sold
            event_data['registrations'] = tickets_sold # Using tickets sold as registrations count for now
            event_data['revenue'] = revenue
            
            results.append(event_data)
            
        return jsonify(results), 200
    except Exception as e:
        print(f"Error fetching organizer events: {e}")
        return jsonify({"message": "Error fetching events"}), 500

@organizer_bp.route('/tickets', methods=['GET'])
@token_required
def get_organizer_tickets(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # 1. Get all events created by this organizer
        # Try both ObjectId and String for robustness
        query = {"$or": [
            {"created_by": current_user['_id']},
            {"created_by": str(current_user['_id'])}
        ]}
        events = list(mongo.db.events.find(query))
        
        results = []
        
        for event in events:
            event_id = str(event['_id'])
            registrations = list(mongo.db.registrations.find({"event_id": event_id}))
            
            # Count sales per ticket type
            sales_map = {}
            for reg in registrations:
                t_type = reg.get('ticket_type', 'General')
                sales_map[t_type] = sales_map.get(t_type, 0) + reg.get('quantity', 1)

            ticket_configs = event.get('tickets', [])
            
            # If tickets configured, use them
            if ticket_configs and len(ticket_configs) > 0:
                for t in ticket_configs:
                    t_name = t.get('name', 'General')
                    sold = sales_map.get(t_name, 0)
                    results.append({
                        "_id": f"{event_id}_{t_name}",
                        "id": f"{event_id}_{t_name}",
                        "name": t_name,
                        "price": float(t.get('price', 0)),
                        "quantity": int(t.get('quantity', 0)),
                        "sold": sold,
                        "is_free": float(t.get('price', 0)) == 0,
                        "event_id": event_id,
                        "event": {
                            "_id": event_id,
                            "title": event.get('title', 'Untitled Event')
                        }
                    })
            else:
                # Fallback for events without configured tickets
                sold = len(registrations)
                results.append({
                    "_id": f"{event_id}_general",
                    "id": f"{event_id}_general",
                    "name": "General Admission",
                    "price": 0,
                    "quantity": int(event.get('capacity', 0)),
                    "sold": sold,
                    "is_free": True,
                    "event_id": event_id,
                    "event": {
                        "_id": event_id,
                        "title": event.get('title', 'Untitled Event')
                    }
                })
                    
        return jsonify(results), 200
        
    except Exception as e:
        print(f"Error fetching organizer tickets: {e}")
        return jsonify({"message": "Error fetching tickets"}), 500

@organizer_bp.route('/transactions', methods=['GET'])
@token_required
def get_organizer_transactions(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # Get organizer's events
        events = list(mongo.db.events.find({"created_by": current_user['_id']}))
        event_map = {str(e['_id']): e['title'] for e in events}
        event_ids = list(event_map.keys())
        
        # Get registrations
        registrations = list(mongo.db.registrations.find({"event_id": {"$in": event_ids}}).sort("registered_at", -1).limit(50))
        
        results = []
        for reg in registrations:
            user = mongo.db.users.find_one({"_id": ObjectId(reg['user_id'])})
            
            results.append({
                "id": str(reg['_id']),
                "user_name": user.get('name', 'Anonymous') if user else 'Anonymous',
                "user_email": user.get('email', '-') if user else '-',
                "event_title": event_map.get(reg['event_id'], 'Unknown Event'),
                "ticket_type": reg.get('ticket_type', 'General'),
                "quantity": reg.get('quantity', 1),
                "price": reg.get('price', 0),
                "total": reg.get('price', 0) * reg.get('quantity', 1),
                "payment_method": reg.get('payment_method', 'Card'),
                "date": reg['registered_at']
            })
            
        return jsonify(results), 200
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return jsonify({"message": "Error fetching transactions"}), 500

@organizer_bp.route('/attendees', methods=['GET'])
@token_required
def get_organizer_attendees(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # Get organizer's events
        events = list(mongo.db.events.find({"created_by": current_user['_id']}))
        event_map = {str(e['_id']): e['title'] for e in events}
        
        # Check for specific event filter
        specific_event_id = request.args.get('event_id')
        if specific_event_id:
            # Verify ownership
            if specific_event_id not in event_map:
                return jsonify({"message": "Event not found or unauthorized"}), 404
            event_ids = [specific_event_id]
        else:
            event_ids = list(event_map.keys())
        
        # Get registrations (Attendees)
        # Limit to last 100 for performance
        registrations = list(mongo.db.registrations.find({"event_id": {"$in": event_ids}}).sort("registered_at", -1).limit(100))
        
        results = []
        for reg in registrations:
            user = mongo.db.users.find_one({"_id": ObjectId(reg['user_id'])})
            
            # Find associated ticket to get status
            ticket = mongo.db.tickets.find_one({"registration_id": str(reg['_id'])})
            status = ticket.get('status') if ticket else 'unknown'
            
            results.append({
                "id": str(reg['_id']),
                "user_id": str(reg['user_id']),
                "display_name": user.get('name', 'Anonymous') if user else 'Anonymous',
                "email": user.get('email', '') if user else '',
                "registered_at": reg['registered_at'],
                "eventTitle": event_map.get(reg['event_id'], 'Unknown Event'),
                "event_id": reg['event_id'],
                "ticket_type": reg.get('ticket_type', 'General'),
                "form_response": reg.get('form_response'),
                "status": status, # 'used' = Checked In, 'valid' = Pending
                "ticket_id": ticket.get('ticket_id') if ticket else None
            })
            
        return jsonify(results), 200

    except Exception as e:
        print(f"Error fetching attendees: {e}")
        return jsonify({"message": "Error fetching attendees"}), 500

@organizer_bp.route('/stats', methods=['GET'])
@token_required
def get_organizer_stats(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        events = list(mongo.db.events.find({"created_by": current_user['_id']}))
        event_ids = [str(e['_id']) for e in events]
        
        registrations = list(mongo.db.registrations.find({"event_id": {"$in": event_ids}}))
        
        total_revenue = sum(reg.get('price', 0) for reg in registrations)
        total_tickets_sold = sum(reg.get('quantity', 1) for reg in registrations)
        
        return jsonify({
            "totalEvents": len(events),
            "totalRevenue": total_revenue,
            "totalTicketsSold": total_tickets_sold,
            "totalFollowers": 0 # Placeholder
        }), 200
    except Exception as e:
        return jsonify({"message": "Error fetching stats"}), 500

@organizer_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_data(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # 1. Fetch all datasets
        events = list(mongo.db.events.find({"created_by": current_user['_id']}))
        event_ids = [str(e['_id']) for e in events]
        registrations = list(mongo.db.registrations.find({"event_id": {"$in": event_ids}}))
        
        # 2. Calculate Headline Metrics
        total_revenue = sum(float(reg.get('price', 0) or 0) for reg in registrations)
        tickets_sold = sum(int(reg.get('quantity', 1) or 0) for reg in registrations)
        
        # Unique attendees (emails)
        attendee_emails = set()
        for reg in registrations:
            # Try to get email from user_id if valid, or direct email field if we had it
            # For now, unique user_ids
            if reg.get('user_id'):
                attendee_emails.add(str(reg['user_id']))
        total_attendees = len(attendee_emails)
        
        active_events = sum(1 for e in events if e.get('status') == 'published')

        # Helper for date normalization
        def get_event_date(e):
            d = e.get('date') or e.get('start_date') or e.get('target_date')
            if isinstance(d, datetime):
                return d.isoformat()
            return str(d) if d else ""

        # Calculate Upcoming vs Past Counts
        now_iso = datetime.utcnow().isoformat()
        upcoming_count = 0
        past_count = 0
        for e in events:
            e_date_str = get_event_date(e)
            if e_date_str and e_date_str > now_iso:
                upcoming_count += 1
            else:
                past_count += 1
        
        # 3. Chart Data (Monthly Revenue & Registrations for last 6 months)
        today = datetime.utcnow()
        chart_data = []
        
        for i in range(5, -1, -1):
            # Calculate month start/end
            date = today - timedelta(days=i*30) # Approx
            month_name = date.strftime("%b")
            month_key = date.strftime("%Y-%m")
            
            # Filter registrations for this month
            month_regs = []
            for r in registrations:
                reg_at = r.get('registered_at')
                if not reg_at:
                    continue
                
                # Handle both datetime objects and ISO strings
                reg_date_str = ""
                if isinstance(reg_at, datetime):
                    reg_date_str = reg_at.strftime("%Y-%m")
                elif isinstance(reg_at, str):
                    reg_date_str = reg_at
                
                if reg_date_str.startswith(month_key):
                    month_regs.append(r)
            
            # Safe summation with casting
            m_rev = sum(float(r.get('price', 0) or 0) for r in month_regs)
            m_count = sum(int(r.get('quantity', 1) or 0) for r in month_regs)
            
            chart_data.append({
                "name": month_name,
                "revenue": m_rev,
                "registrations": m_count
            })

        # 4. Upcoming Events
        upcoming = []
        
        # Sort using standardized date strings to avoid TypeError between str and datetime
        sorted_events = sorted(events, key=lambda x: get_event_date(x), reverse=False)
        
        for e in sorted_events:
            e_date_str = get_event_date(e)
            
            # Using standardized string comparison
            if e_date_str and e_date_str > now_iso and e.get('status') == 'published':
                e_data = {k: str(v) if isinstance(v, ObjectId) else v for k, v in e.items()}
                e_data['id'] = str(e['_id'])
                if '_id' in e_data: del e_data['_id']
                upcoming.append(e_data)
                if len(upcoming) >= 5: break
                
        # 5. Recent Activity (Just registrations for now)
        recent_activity = []
        
        # Helper for registration date normalization
        def get_reg_date(r):
            d = r.get('registered_at')
            if isinstance(d, datetime):
                return d.isoformat()
            return str(d) if d else ""

        # Use safe standardized sorting key
        sorted_regs = sorted(registrations, key=lambda x: get_reg_date(x), reverse=True)[:5]
        
        for r in sorted_regs:
            # Find event title
            e_title = next((e['title'] for e in events if str(e['_id']) == r.get('event_id')), 'Unknown Event')
            recent_activity.append({
                "id": str(r['_id']),
                "type": "registration",
                "message": f"New ticket sold for {e_title}",
                "time": r.get('registered_at')
            })

        return jsonify({
            "stats": {
                "totalRevenue": total_revenue,
                "ticketsSold": tickets_sold,
                "activeEvents": active_events,
                "totalAttendees": total_attendees,
                "upcomingEventsCount": upcoming_count,
                "pastEventsCount": past_count,
            },
            "chartData": chart_data,
            "upcomingEvents": upcoming,
            "recentActivity": recent_activity
        }), 200

    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        print(f"Error fetching dashboard data: {trace}")
        return jsonify({"message": f"Error: {str(e)}", "trace": trace}), 500

@organizer_bp.route('/earnings', methods=['GET'])
@token_required
def get_organizer_earnings(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # Get events
        events = list(mongo.db.events.find({"created_by": current_user['_id']}))
        event_ids = [str(e['_id']) for e in events]
        
        # Get registrations (revenue source)
        registrations = list(mongo.db.registrations.find({"event_id": {"$in": event_ids}}))
        
        total_earnings = sum(reg.get('price', 0) for reg in registrations)
        
        # Calculate revenue per event
        event_revenue = {}
        for reg in registrations:
            eid = reg['event_id']
            price = reg.get('price', 0)
            event_revenue[eid] = event_revenue.get(eid, 0) + price
            
        breakdown = []
        for event in events:
            eid = str(event['_id'])
            rev = event_revenue.get(eid, 0)
            if rev > 0: # Only show events with revenue
                breakdown.append({
                    "event_id": eid,
                    "title": event['title'],
                    "revenue": rev,
                    "status": "available" # All revenue available for now
                })
        
        # Mock payouts for now as we don't have a payout system
        payouts = [] 
        
        return jsonify({
            "totalEarnings": total_earnings,
            "availableBalance": total_earnings, # Assuming no payouts yet
            "pendingPayouts": 0,
            "totalPaidOut": 0,
            "breakdown": breakdown,
            "payouts": payouts
        }), 200

    except Exception as e:
        print(f"Error fetching earnings: {e}")
        return jsonify({"message": "Error fetching earnings"}), 500

@organizer_bp.route('/reviews', methods=['GET'])
@token_required
def get_organizer_reviews(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        # Get events
        events = list(mongo.db.events.find({"created_by": current_user['_id']}))
        event_map = {str(e['_id']): e['title'] for e in events}
        event_ids = list(event_map.keys())
        
        # Get reviews for these events
        # Note: 'reviews' collection assumed since not found in grep
        reviews = list(mongo.db.reviews.find({"event_id": {"$in": event_ids}}).sort("created_at", -1))
        
        results = []
        for r in reviews:
            user = mongo.db.users.find_one({"_id": ObjectId(r.get('user_id'))})
            results.append({
                "id": str(r['_id']),
                "attendeeName": user.get('name', 'Anonymous') if user else 'Anonymous',
                "eventTitle": event_map.get(str(r['event_id']), 'Unknown Event'),
                "rating": r.get('rating', 0),
                "comment": r.get('comment', ''),
                "createdAt": r.get('created_at'),
                "status": r.get('status', 'published'),
                "response": r.get('response')
            })
            
        return jsonify(results), 200

    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return jsonify({"message": "Error fetching reviews"}), 500

@organizer_bp.route('/events', methods=['POST'])
@token_required
def create_event(current_user):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        data = request.json
        
        # Validation
        required = ['title', 'description', 'category', 'startDate', 'startTime']
        missing = [f for f in required if not data.get(f)]
        if missing:
             return jsonify({"message": f"Missing required fields: {', '.join(missing)}"}), 400
        
        # Date Validation
        if data.get('startDate') and data.get('endDate'):
            if data['endDate'] < data['startDate']:
                return jsonify({"message": "End date cannot be earlier than start date"}), 400

        # Create event object
        new_event = {
            "created_by": current_user['_id'],
            "title": data.get('title'),
            "description": data.get('description'),
            "category": data.get('category'),
            "tags": data.get('tags', []),
            "cover_image": data.get('coverImage'),
            "is_online": data.get('isOnline', False),
            
            # Dates
            "start_date": data.get('startDate'),
            "end_date": data.get('endDate'),
            "start_time": data.get('startTime'),
            "end_time": data.get('endTime'),
            "timezone": data.get('timezone'),
            
            # Location
            "venue": data.get('venue'),
            "address": data.get('address'),
            "city": data.get('city'),
            "virtual_platform": data.get('virtualPlatform'),
            "virtual_link": data.get('virtualLink'),
            
            # Tickets (ensure form_id is preserved)
            "tickets": data.get('tickets', []),
            "capacity": int(data.get('capacity', 0)),
            "enable_waitlist": data.get('enableWaitlist', False),
            
            # Schedule
            "sessions": data.get('sessions', []),
            "tracks": data.get('tracks', []),
            
            # Settings
            "require_approval": data.get('requireApproval', False),
            "show_remaining": data.get('showRemainingTickets', True),
            "allow_refunds": data.get('allowRefunds', True),
            "refund_deadline": int(data.get('refundDeadlineDays', 7)),
            "visibility": data.get('visibility', 'public'),
            
            "status": data.get('status', 'published'),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = mongo.db.events.insert_one(new_event)
        event_id = str(result.inserted_id)
        
        # Handle Promotions
        promotions = data.get('promotion_codes', [])
        if promotions:
            promo_docs = []
            for p in promotions:
                promo_docs.append({
                    "created_by": current_user['_id'],
                    "event_id": event_id,
                    "code": p.get('code', '').upper(),
                    "type": p.get('type', 'fixed'),
                    "amount": float(p.get('amount', 0)),
                    "usage_limit": int(p.get('usageLimit', 0)),
                    "used_count": 0,
                    "status": "active",
                    "created_at": datetime.utcnow()
                })
            if promo_docs:
                mongo.db.promotions.insert_many(promo_docs)
        
        return jsonify({
            "message": "Event created successfully",
            "event_id": event_id
        }), 201

    except Exception as e:
        print(f"Error creating event: {e}")
        return jsonify({"message": "Error creating event"}), 500


@organizer_bp.route('/events/<event_id>', methods=['PUT'])
@token_required
def update_event_details(current_user, event_id):
    if not current_user.get('is_organizer'):
        return jsonify({"message": "Organizer access required"}), 403
    try:
        data = request.json
        
        # Verify ownership
        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"message": "Event not found"}), 404
            
        # Check explicit string match or ObjectId match
        if str(event.get('created_by')) != str(current_user['_id']):
            return jsonify({"message": "Unauthorized"}), 403

        # Validation (same as create)
        if data.get('startDate') and data.get('endDate'):
            if data['endDate'] < data['startDate']:
                return jsonify({"message": "End date cannot be earlier than start date"}), 400

        # Construct update fields
        update_fields = {
            "title": data.get('title'),
            "description": data.get('description'),
            "category": data.get('category'),
            "tags": data.get('tags', []),
            "cover_image": data.get('coverImage'),
            "is_online": data.get('isOnline', False),
            
            # Dates
            "start_date": data.get('startDate'),
            "end_date": data.get('endDate'),
            "start_time": data.get('startTime'),
            "end_time": data.get('end_time'),
            "timezone": data.get('timezone'),
            
            # Location
            "venue": data.get('venue'),
            "address": data.get('address'),
            "city": data.get('city'),
            "virtual_platform": data.get('virtualPlatform'),
            "virtual_link": data.get('virtualLink'),
            
            # Tickets (Full replace)
            "tickets": data.get('tickets', []),
            "capacity": int(data.get('capacity', 0)),
            "enable_waitlist": data.get('enableWaitlist', False),
            
            # Schedule
            "sessions": data.get('sessions', []),
            "tracks": data.get('tracks', []),
            
            # Settings
            "require_approval": data.get('requireApproval', False),
            "show_remaining": data.get('showRemainingTickets', True),
            "allow_refunds": data.get('allowRefunds', True),
            "refund_deadline": int(data.get('refundDeadlineDays', 7)),
            "visibility": data.get('visibility', 'public'),
            
            "status": data.get('status', 'published'),
            "updated_at": datetime.utcnow()
        }
        
        # Remove None values to allow partial updates if needed, 
        # but typically organizer form sends full state.
        # For array fields, we trust the frontend sends the complete new list.
        
        mongo.db.events.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": update_fields}
        )
        
        # Handle Promotions (Full Replace Strategy for simplicity and consistency)
        # 1. Remove existing promotions for this event
        mongo.db.promotions.delete_many({"event_id": event_id})
        
        # 2. Insert new ones
        promotions = data.get('promotion_codes', [])
        if promotions:
            promo_docs = []
            for p in promotions:
                promo_docs.append({
                    "created_by": current_user['_id'],
                    "event_id": event_id,
                    "code": p.get('code', '').upper(),
                    "type": p.get('type', 'fixed'),
                    "amount": float(p.get('amount', 0)),
                    "usage_limit": int(p.get('usageLimit', 0)),
                    "used_count": p.get('used_count', 0), # Preserve if passed back, else 0
                    "status": "active",
                    "created_at": datetime.utcnow() # Reset created_at or keep original? Resetting for new batch is fine for now
                })
            if promo_docs:
                mongo.db.promotions.insert_many(promo_docs)
        
        return jsonify({
            "message": "Event updated successfully",
            "event_id": event_id
        }), 200

    except Exception as e:
        print(f"Error updating event: {e}")
        return jsonify({"message": "Error updating event"}), 500
