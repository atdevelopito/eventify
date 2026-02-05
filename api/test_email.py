
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def test_email():
    smtp_host = os.getenv('RESEND_SMTP_HOST')
    smtp_port = int(os.getenv('RESEND_SMTP_PORT', 465))
    smtp_user = os.getenv('RESEND_SMTP_USER')
    smtp_pass = os.getenv('RESEND_SMTP_PASS')
    
    sender = "onboarding@resend.dev"
    recipient = "delivered@resend.dev" # Resend allows sending here for testing success without an account? 
    # No, typically you send to your own email.
    # I'll try sending to the user's likely email or a dummy and see the error.
    # If I send to "delivered@resend.dev", it returns 250 OK usually for testing integration.
    # Let's try sending to "test@example.com" and see if it errors.
    
    print(f"Connecting to {smtp_host}:{smtp_port}...")
    try:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        server.login(smtp_user, smtp_pass)
        print("Login successful")
        
        msg = MIMEMultipart()
        msg['From'] = f"Eventify <{sender}>"
        msg['To'] = "test@example.com"
        msg['Subject'] = "Test Email"
        msg.attach(MIMEText("This is a test.", 'plain'))
        
        server.sendmail(sender, "test@example.com", msg.as_string())
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_email()
