"""
Background tasks for ticket generation via Celery.
"""
from src.celery_app import celery
from src.utils.ticket_utils import generate_tickets_for_registration
from src.database import mongo
from bson import ObjectId

@celery.task(bind=True, max_retries=3, default_retry_delay=30)
def generate_tickets_task(self, registration_id, user_id, event_id, quantity, ticket_type):
    """
    Background task to generate tickets for a registration.
    Includes idempotency checks and error handling.
    """
    try:
        # Check if registration exists and is confirmed
        registration = mongo.db.registrations.find_one({"_id": ObjectId(registration_id)})
        if not registration:
            print(f"Registration {registration_id} not found. Skipping ticket generation.")
            return None
        
        # We only generate tickets for confirmed registrations
        if registration.get('status') != 'confirmed':
            print(f"Registration {registration_id} is not confirmed. Current status: {registration.get('status')}")
            return None

        # Call the existing utility function
        ticket_ids = generate_tickets_for_registration(
            registration_id=registration_id,
            user_id=user_id,
            event_id=event_id,
            quantity=quantity,
            ticket_type=ticket_type
        )
        
        print(f"Generated {len(ticket_ids)} tickets for registration {registration_id}")
        return ticket_ids

    except Exception as exc:
        # Retry for transient errors (e.g. database connectivity)
        print(f"Error generating tickets for {registration_id}: {exc}")
        raise self.retry(exc=exc)
