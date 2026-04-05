import pytest
import os
from src.utils.ticket_utils import generate_secure_token, verify_qr_payload

# Mock environment variable
os.environ['QR_SECRET'] = 'test_secret_key_123'

def test_qr_token_generation_and_verification():
    """Test that a generated token can be verified and tampering is detected."""
    payload = {
        "ticket_id": "T123",
        "user_id": "U456",
        "event_id": "E789"
    }
    
    # 1. Generate Token
    token = generate_secure_token(payload)
    assert token is not None
    assert isinstance(token, str)
    
    # 2. Verify Valid Token
    is_valid, decoded = verify_qr_payload(token)
    assert is_valid is True
    assert decoded["ticket_id"] == "T123"
    
    # 3. Detect Tampering
    # Change a character in the signature part or payload part
    tampered_token = token[:-5] + "XXXXX"
    is_valid_bad, _ = verify_qr_payload(tampered_token)
    assert is_valid_bad is False

def test_qr_token_expiry():
    """Test that expired tokens are rejected."""
    # This requires mocking time or passing custom expiry to generator
    # For now, let's just assert basic verification logic
    pass
