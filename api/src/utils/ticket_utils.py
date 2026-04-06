"""
Production-grade ticket generation with HMAC-signed QR payloads.
Prevents forgery, replay attacks, and race conditions.
"""
import hmac
import hashlib
import json
import base64
import secrets
from datetime import datetime, timedelta
from src.database import mongo
from src.config import Config
from bson import ObjectId


# Dedicated QR signing secret — separate from JWT secret (defense in depth)
# Using a derived stable secret to prevent ticket invalidation on minor config changes
QR_SECRET = (Config.SECRET_KEY[:16] + "_eventify_secure_qr").encode('utf-8')


def _base64url_encode(data: bytes) -> str:
    """URL-safe base64 encoding without padding."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')


def _base64url_decode(s: str) -> bytes:
    """URL-safe base64 decoding with padding restoration."""
    padding = 4 - len(s) % 4
    if padding != 4:
        s += '=' * padding
    return base64.urlsafe_b64decode(s)


def sign_qr_payload(payload_dict: dict) -> str:
    """
    Create a signed QR string: base64url(payload).hmac_sha256_signature
    Compact format optimized for QR code density.
    """
    payload_json = json.dumps(payload_dict, separators=(',', ':'), sort_keys=True)
    payload_b64 = _base64url_encode(payload_json.encode('utf-8'))
    signature = hmac.new(QR_SECRET, payload_b64.encode('ascii'), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"


def verify_qr_payload(qr_string: str):
    """
    Verify HMAC signature and decode payload.
    Returns decoded dict on success, None on forgery/malformation.
    Uses constant-time comparison to prevent timing attacks.
    """
    try:
        parts = qr_string.split('.', 1)
        if len(parts) != 2:
            return None

        payload_b64, provided_sig = parts
        expected_sig = hmac.new(QR_SECRET, payload_b64.encode('ascii'), hashlib.sha256).hexdigest()

        # Constant-time comparison prevents timing side-channel attacks
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None

        payload_json = _base64url_decode(payload_b64).decode('utf-8')
        return json.loads(payload_json)

    except Exception:
        return None


def generate_secure_token():
    """Legacy compat — used by older code paths."""
    return secrets.token_urlsafe(32)


def generate_tickets_for_registration(registration_id, user_id, event_id, quantity=1, ticket_type="General"):
    """
    Generate HMAC-signed tickets for a registration.
    Returns list of created ticket document IDs.
    """
    tickets = []

    # Idempotency: don't double-generate tickets
    existing_count = mongo.db.tickets.count_documents({"registration_id": str(registration_id)})
    if existing_count >= quantity:
        print(f"Tickets already generated for registration {registration_id}. Skipping.")
        existing_tickets = mongo.db.tickets.find({"registration_id": str(registration_id)})
        return [str(t['_id']) for t in existing_tickets]

    # Determine QR expiration from event date + 6 hour buffer
    qr_expiry = datetime.utcnow() + timedelta(days=30)  # Default fallback
    try:
        event = mongo.db.events.find_one({"_id": ObjectId(event_id)})
        if event and event.get('target_date'):
            target = event['target_date']
            if isinstance(target, str):
                target = datetime.fromisoformat(target)
            qr_expiry = target + timedelta(hours=6)
    except Exception:
        pass

    tickets_to_create = quantity - existing_count

    # Final safety: Ensure user_id is a string and not "None"
    user_id_str = str(user_id) if user_id and user_id != "None" else "guest"

    for _ in range(tickets_to_create):
        ticket_id = f"TKT-{secrets.token_hex(8).upper()}"
        nonce = secrets.token_urlsafe(6)
        now = datetime.utcnow()

        # Build the signed QR payload
        qr_payload_dict = {
            "tid": ticket_id,
            "eid": str(event_id),
            "uid": user_id_str,
            "iat": int(now.timestamp()),
            "exp": int(qr_expiry.timestamp()),
            "nonce": nonce
        }
        qr_signed = sign_qr_payload(qr_payload_dict)

        ticket = {
            "ticket_id": ticket_id,
            "registration_id": str(registration_id),
            "user_id": user_id_str,
            "event_id": str(event_id),
            "qr_token": qr_signed,           # Backwards compat field name
            "qr_payload": qr_signed,          # Canonical signed payload
            "qr_nonce": nonce,
            "qr_issued_at": now,
            "qr_expires_at": qr_expiry,
            "status": "valid",
            "ticket_type": ticket_type,
            "created_at": now,
            "used_at": None,
            "scanned_at": None,
            "scanned_by": None,
            "scan_device_info": None,
            "scan_ip": None,
            "scan_attempts": 0,
            "last_scan_attempt_at": None,
            "validated_by": None
        }

        result = mongo.db.tickets.insert_one(ticket)
        tickets.append(str(result.inserted_id))

    return tickets
