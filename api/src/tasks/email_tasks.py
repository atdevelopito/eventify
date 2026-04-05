"""
Background tasks for sending emails via Celery.
"""
from src.celery_app import celery
from src.services.email_service import EmailService

@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email_task(self, to_email, token):
    """Task to send account verification email."""
    try:
        success = EmailService.send_verification_email(to_email, token)
        if not success:
            raise Exception("Email delivery failed")
        return True
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email_task(self, to_email, token):
    """Task to send password reset email."""
    try:
        success = EmailService.send_password_reset_email(to_email, token)
        if not success:
            raise Exception("Email delivery failed")
        return True
    except Exception as exc:
        raise self.retry(exc=exc)

@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_organizer_approval_email_task(self, to_email, name):
    """Task to send organizer approval email."""
    try:
        success = EmailService.send_organizer_approval_email(to_email, name)
        if not success:
            raise Exception("Email delivery failed")
        return True
    except Exception as exc:
        raise self.retry(exc=exc)

@celery.task(bind=True, max_retries=2, default_retry_delay=30)
def send_event_entry_email_task(self, to_email, event_name, ticket_id):
    """Task to send event entry confirmation email."""
    try:
        success = EmailService.send_event_entry_email(to_email, event_name, ticket_id)
        if not success:
            raise Exception("Email delivery failed")
        return True
    except Exception as exc:
        raise self.retry(exc=exc)
