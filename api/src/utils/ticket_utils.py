"""
Ticket generation utilities
"""
from src.database import mongo
from datetime import datetime
import secrets

def generate_secure_token():
    """Generate a cryptographically secure random token for QR codes"""
    return secrets.token_urlsafe(32)

def generate_tickets_for_registration(registration_id, user_id, event_id, quantity=1, ticket_type="General"):
    """
    Generate tickets for a registration
    Returns list of created ticket IDs
    """
    tickets = []
    
    # Idempotency Check
    existing_count = mongo.db.tickets.count_documents({"registration_id": str(registration_id)})
    
    if existing_count >= quantity:
        print(f"Tickets already generated for registration {registration_id}. Skipping.")
        # Return existing tickets
        existing_tickets = mongo.db.tickets.find({"registration_id": str(registration_id)})
        return [str(t['_id']) for t in existing_tickets]

    tickets_to_create = quantity - existing_count
    
    for i in range(tickets_to_create):
        ticket = {
            "ticket_id": f"TKT-{secrets.token_hex(8).upper()}",
            "registration_id": registration_id,
            "user_id": user_id,
            "event_id": event_id,
            "qr_token": generate_secure_token(),
            "status": "valid",
            "ticket_type": ticket_type,
            "created_at": datetime.utcnow(),
            "used_at": None,
            "validated_by": None
        }
        
        result = mongo.db.tickets.insert_one(ticket)
        tickets.append(str(result.inserted_id))
    
    return tickets
