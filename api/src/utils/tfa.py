"""
Two-Factor Authentication (2FA) utility using TOTP.
Allows generating secrets, provisioning URLs for authenticator apps, and verifying codes.
"""
import pyotp
import qrcode
import io
import base64

class TFA:
    @staticmethod
    def generate_secret():
        """Generates a base32 encoded random secret."""
        return pyotp.random_base32()

    @staticmethod
    def get_provisioning_uri(user_email, secret):
        """Generates a URI for the authenticator app (Google Authenticator, Authy, etc.)."""
        return pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name="Eventify"
        )

    @staticmethod
    def generate_qr_code_base64(provisioning_uri):
        """Generates a base64 encoded QR code PNG for display on the frontend."""
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

    @staticmethod
    def verify_totp(secret, code):
        """Verifies the TOTP code against the secret. Includes a small time drift window."""
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=1) # Window allows for slight clock desync (30s)
