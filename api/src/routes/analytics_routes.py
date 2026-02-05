from flask import Blueprint, jsonify
from src.database import mongo
from bson.objectid import ObjectId

analytics_bp = Blueprint('analytics_bp', __name__)

@analytics_bp.route('/public/<user_id>/stats', methods=['GET'])
def get_public_organizer_stats(user_id):
    try:
        # Robust Query for Created By (String or ObjectId)
        query_conditions = [{"created_by": user_id}]
        try:
            query_conditions.append({"created_by": ObjectId(user_id)})
        except:
            pass
            
        query = {"$or": query_conditions}

        events = list(mongo.db.events.find(query))
        
        # Determine event IDs for registration lookup
        # Events might use ObjectId as _id
        event_ids = [str(e['_id']) for e in events]
        
        if not event_ids:
             return jsonify({
                "totalEvents": 0,
                "totalRevenue": 0,
                "totalRegistrations": 0,
                "upcomingEvents": 0,
                "avgRegistrations": 0
            }), 200

        # Fetch registrations for these events
        # Note: ensuring event_id in registrations matches string format
        registrations = list(mongo.db.registrations.find({"event_id": {"$in": event_ids}}))
        
        total_revenue = 0.0
        total_tickets_sold = 0

        for reg in registrations:
            # Safely handle quantity
            try:
                qty = int(reg.get('quantity', 1))
            except (ValueError, TypeError):
                qty = 1
            
            # Safely handle price
            try:
                 price = float(reg.get('price', 0))
            except (ValueError, TypeError):
                 price = 0.0

            total_revenue += price * qty
            total_tickets_sold += qty
        
        # Calculate Upcoming Events safely
        import datetime
        from dateutil import parser
        
        current_time = datetime.datetime.utcnow()
        upcoming_count = 0
        
        for e in events:
            date_str = e.get('date') or e.get('start_date')
            if date_str:
                try:
                    # Parse ISO strings or other formats robustly
                    # If date is already datetime object (unlikely from mongo driver unless configured), handle it
                    if isinstance(date_str, datetime.datetime):
                        evt_date = date_str
                    else:
                        evt_date = parser.parse(str(date_str))
                    
                    # Compare offset-naive if needed, assuming UTC for simplicity or relying on parse
                    # Adjusting current_time to be consistent if parse returns offset-aware
                    if evt_date.tzinfo is None:
                        if evt_date >= current_time:
                            upcoming_count += 1
                    else:
                        # If date has timezone, compare with timezone aware current time
                        if evt_date >= datetime.datetime.now(evt_date.tzinfo):
                            upcoming_count += 1
                except Exception as parse_err:
                    # Fallback or ignore invalid dates
                    pass

        avg_registrations = 0
        if len(events) > 0:
            avg_registrations = total_tickets_sold / len(events)

        return jsonify({
            "totalEvents": len(events),
            "totalRegistrations": total_tickets_sold,
            "upcomingEvents": upcoming_count,
            "avgRegistrations": round(avg_registrations, 1),
            "totalRevenue": round(total_revenue, 2)
        }), 200

    except Exception as e:
        print(f"Error fetching public stats: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": "Error fetching stats"}), 500
