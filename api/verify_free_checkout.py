import requests
import json
import sys
import time

BASE_URL = "http://127.0.0.1:5000/api"

def run_test():
    print("🚀 Starting FREE Checkout API Verification...")
    
    # 1. Register a temporary user
    timestamp = int(time.time())
    user_email = f"free_buyer_{timestamp}@gmail.com"
    password = "password123"
    
    print(f"1. Registering user: {user_email}")
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Free Buyer",
            "email": user_email,
            "password": password,
            "role": "organizer" 
        }, headers={"Content-Type": "application/json"})
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
        
    # 2. Use Auto-Login Token
    token = res.json().get('token')
    if not token:
        print("❌ No token received!")
        return False
        
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 3. Create a FREE test event
    print("3. Creating FREE test event...")
    event_payload = {
        "title": "Free Meetup Test",
        "date": "2026-12-31",
        "time": "10:00",
        "description": "Free event test",
        "tickets": [
            {"name": "Free Entry", "price": 0, "quantity": 100, "type": "free"}
        ]
    }
    
    res = requests.post(f"{BASE_URL}/events", json=event_payload, headers=headers)
    if res.status_code != 201:
        print(f"❌ Event creation failed: {res.text}")
        return False
        
    event_id = res.json().get('id')
    print(f"✅ Free Event created: {event_id}")
    
    # 4. Register for Free Event
    print(f"\n💳 Registering for free event: {event_id}")
    reg_payload = {
        "event_id": event_id,
        "ticket_type": "Free Entry",
        "quantity": 1,
        "price": 0,
        "payment_method": "n/a"
    }
    
    reg_res = requests.post(f"{BASE_URL}/registrations", json=reg_payload, headers=headers)
    if reg_res.status_code != 201:
        print(f"❌ Registration failed: {reg_res.text}")
        return False
        
    reg_data = reg_res.json()
    print(f"✅ Registration Response: Status={reg_data.get('status')}, PaymentStatus={reg_data.get('payment_status')}")
    print(f"✅ Tickets Generated: {len(reg_data.get('tickets', []))}")
    
    if reg_data.get('status') != 'confirmed':
        print("❌ FAILURE: Free event should be 'confirmed' immediately!")
        return False
        
    if reg_data.get('payment_status') != 'paid':
        print("❌ FAILURE: Free event should be 'paid' immediately!")
        return False
        
    if len(reg_data.get('tickets', [])) == 0:
         print("❌ FAILURE: Free event should generate tickets immediately!")
         return False

    print("\n🎉 Free Event Flow Verification COMPLETE!")
    return True

if __name__ == "__main__":
    if run_test():
        sys.exit(0)
    else:
        sys.exit(1)
