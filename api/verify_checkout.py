import requests
import json
import sys
import time

BASE_URL = "http://127.0.0.1:5000/api"

def run_test():
    print("🚀 Starting Checkout API Verification...")
    
    # 1. Register a temporary user
    timestamp = int(time.time())
    user_email = f"test_buyer_{timestamp}@gmail.com"
    password = "password123"
    
    print(f"1. Registering user: {user_email}")
    try:
        res = requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Test Buyer",
            "email": user_email,
            "password": password,
            "role": "organizer"
        }, headers={"Content-Type": "application/json"})
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
    
    if res.status_code not in [201, 409]:
        print(f"❌ User Registration failed: {res.status_code}")
        print(f"   Response: {res.text}")
        return False
        
    
    # 2. Use Auto-Login Token
    print("2. Using Auto-Login Token from registration...")
    token = res.json().get('token')
    if not token:
        print("❌ No token received from registration!")
        return False
        
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 3. Create a test event
    print("3. Creating test event...")
    event_payload = {
        "title": "Checkout Test Event",
        "date": "2026-12-31",
        "time": "23:59",
        "description": "Testing checkout flow",
        "tickets": [
            {"name": "General Admission", "price": 100, "quantity": 50, "type": "paid"},
            {"name": "VIP", "price": 200, "quantity": 10, "type": "paid"}
        ]
    }
    
    res = requests.post(f"{BASE_URL}/events", json=event_payload, headers=headers)
    if res.status_code != 201:
        print(f"❌ Event creation failed: {res.status_code}")
        print(res.text)
        return False
        
    event_id = res.json().get('id')
    print(f"✅ Event created: {event_id}")
    
    # 4. Create a Registration (Checkout)
    print(f"\n💳 Placing order for event: {event_id}")
    reg_payload = {
        "event_id": event_id,
        "ticket_type": "VIP",
        "quantity": 2,
        "price": 100,
        "payment_method": "bkash",
        # Frontend might send these, but backend should IGNORE them for paid events
        "status": "confirmed", 
        "payment_status": "paid"
    }
    
    reg_res = requests.post(f"{BASE_URL}/registrations", json=reg_payload, headers=headers)
    if reg_res.status_code != 201:
        print(f"❌ Registration failed: {reg_res.text}")
        return False
        
    reg_data = reg_res.json()
    reg_id = reg_data['id']
    print(f"✅ Order initiated! ID: {reg_id}")
    print(f"   Initial Status (Should be pending): {reg_data.get('status')} [{('✅ OK' if reg_data.get('status') == 'pending' else '❌ FAIL')}]")
    
    if reg_data.get('status') != 'pending':
        print("❌ SECURITY FAILURE: Backend accepted frontend status!")
        return False

    # 5. Confirm Payment (Simulate 2nd step)
    print(f"\n🔄 Confirming payment for order: {reg_id}...")
    confirm_res = requests.post(f"{BASE_URL}/registrations/{reg_id}/confirm_payment", headers=headers)
    
    if confirm_res.status_code == 200:
        confirm_data = confirm_res.json()
        print(f"✅ Payment Confirmed! Status: {confirm_data.get('status')}")
        print(f"✅ Tickets Generated: {len(confirm_data.get('tickets', []))}")
        if len(confirm_data.get('tickets', [])) == 2:
            return True
        else:
            print("❌ Ticket count mismatch!")
            return False
            
    else:
        print(f"❌ Order failed: {res.status_code}")
        print(res.text)
        return False

if __name__ == "__main__":
    if run_test():
        print("\n✅ PASSED: Checkout API Logic is working.")
        sys.exit(0)
    else:
        print("\n❌ FAILED: Checkout API Logic issue detected.")
        sys.exit(1)
