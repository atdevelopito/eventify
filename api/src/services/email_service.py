
import resend
from src.config import Config

class EmailService:
    @staticmethod
    def send_email(to_email, subject, body):
        resend.api_key = Config.RESEND_SMTP_PASS # The password field usually holds the API key for Resend

        try:
            print(f"Attempting to send email to {to_email} via Resend SDK...")
            
            # Try primary domain first
            sender = "Eventify <noreply@eventify.fun>"
            
            params = {
                "from": sender,
                "to": [to_email],
                "subject": subject,
                "html": body,
            }

            # Development logging
            print("\n" + "="*50)
            print(f"EMAIL TO: {to_email}")
            print(f"SUBJECT: {subject}")
            print(f"BODY:\n{body}")
            print("="*50 + "\n")

            email = resend.Emails.send(params)
            print(f"Email sent successfully: {email}")
            return True
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            # Fallback/Retry logic could go here if we wanted to try another domain
            # But let's stick to the requested one.
            return False

    @staticmethod
    def send_verification_email(to_email, token):
        subject = "Verify your Eventify Account"
        verify_link = f"{Config.ORGANIZER_URL}/verify?token={token}"
        body = f"""
        <h1>Welcome to Eventify!</h1>
        <p>Please verify your account by clicking the link below:</p>
        <a href="{verify_link}">Verify Account</a>
        <p>Or use this link: {verify_link}</p>
        <br>
        <p><strong>Verification Token (for manual entry):</strong></p>
        <p style="word-break: break-all; background: #f4f4f4; padding: 10px; border-radius: 4px;">{token}</p>
        <p>This link will expire in 7 days.</p>
        """
        return EmailService.send_email(to_email, subject, body)

    @staticmethod
    def send_password_reset_email(to_email, token):
        subject = "Reset your Eventify Password"
        reset_link = f"https://eventify.fun/reset-password?token={token}"
        body = f"""
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="{reset_link}">Reset Password</a>
        <p>Or copy this link: {reset_link}</p>
        <p>This link expires in 24 hours.</p>
        """
        return EmailService.send_email(to_email, subject, body)

    @staticmethod
    def send_organizer_approval_email(to_email, name):
        subject = "Your Organizer Application has been Approved!"
        login_link = f"{Config.ORGANIZER_URL}/login"
        body = f"""
        <h1>Congratulations, {name}!</h1>
        <p>Your application to become an Eventify Organizer has been approved.</p>
        <p>You can now access your organizer dashboard and start creating events.</p>
        <br>
        <a href="{login_link}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a>
        <br><br>
        <p>Or use this link: {login_link}</p>
        <p>Welcome to the team!</p>
        """
        return EmailService.send_email(to_email, subject, body)

    @staticmethod
    def send_event_entry_email(to_email, event_name, ticket_id):
        subject = f"Welcome to {event_name}!"
        body = f"""
        <h1>Welcome to {event_name}!</h1>
        <p>We are thrilled to have you here.</p>
        <p>Your ticket ({ticket_id}) has been successfully scanned.</p>
        <p>Enjoy the event!</p>
        <br>
        <p>Best regards,</p>
        <p>The Event Team</p>
        """
        return EmailService.send_email(to_email, subject, body)
