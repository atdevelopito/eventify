
import requests
import json
import time

BASE_URL = "http://localhost:5000/api"
EMAIL = "test_user_repro_v2@gmail.com"
PASSWORD = "password123"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def login_or_register():
    # Try Login
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
        if res.status_code == 200:
            return res.json()['token'], res.json()['user']['id']
    except:
        pass

    # Register if failed
    print("Registering new user...")
    res = requests.post(f"{BASE_URL}/auth/register", json={"email": EMAIL, "password": PASSWORD, "name": "Test Repro"})
    if res.status_code == 201:
        return res.json()['token'], res.json()['user']['id']
    else:
        print("Registration failed:", res.text)
        return None, None

def run_repro():
    token, user_id = login_or_register()
    if not token:
        print("Could not auth.")
        return

    headers = {"Authorization": f"Bearer {token}"}
    print(f"Authenticated as User ID: {user_id}")

    # 1. Fetch Event
    # Assuming 'Scientifica' exists or similar
    # We need a valid event ID. Let's list events.
    res = requests.get(f"{BASE_URL}/events")
    events = res.json()
    if not events:
        print("No events found.")
        return
    
    event = events[0]
    event_id = event['_id'] if '_id' in event else event['id']
    print(f"Target Event: {event.get('title')} ({event_id})")

    # 2. Checkout Round 1
    print_step("Round 1: Purchasing Ticket A")
    reg_data = {
        "event_id": event_id,
        "ticket_type": "Repro Ticket A",
        "quantity": 1,
        "price": 0, # Free for auto-confirm
        "payment_method": "Card"
    }
    
    res = requests.post(f"{BASE_URL}/registrations", json=reg_data, headers=headers)
    print("Registration Resp:", res.status_code)
    reg_id_1 = res.json().get('id')
    
    # Confirm (if not free/auto)
    # requests.post(f"{BASE_URL}/registrations/{reg_id_1}/confirm_payment", headers=headers)

    # Check My Tickets
    res = requests.get(f"{BASE_URL}/tickets/my", headers=headers)
    tickets_1 = res.json()
    print(f"My Tickets Count: {len(tickets_1)}")
    for t in tickets_1:
         print(f" - {t.get('ticket_type')} (ID: {t.get('id')})")

    # 3. Checkout Round 2
    print_step("Round 2: Purchasing Ticket B (Simulating 'Go Back' and buy again)")
    reg_data_2 = {
        "event_id": event_id,
        "ticket_type": "Repro Ticket B",
        "quantity": 1,
        "price": 0,
        "payment_method": "Card"
    }

    res = requests.post(f"{BASE_URL}/registrations", json=reg_data_2, headers=headers)
    print("Registration Resp:", res.status_code)
    
    # Check My Tickets Again
    res = requests.get(f"{BASE_URL}/tickets/my", headers=headers)
    tickets_2 = res.json()
    print(f"My Tickets Count: {len(tickets_2)}")
    
    t1_found = any(t['ticket_type'] == "Repro Ticket A" for t in tickets_2)
    t2_found = any(t['ticket_type'] == "Repro Ticket B" for t in tickets_2)
    
    if not t1_found:
        print("[BUG DETECTED] Ticket A disappeared!")
    else:
         print("Ticket A is present.")
         
    if not t2_found:
         print("Ticket B missing.")
    else:
         print("Ticket B is present.")

    # 4. Simulate Duplicate Submission (Frontend Glitch?)
    print_step("Round 3: Simulating Dubplicate Submission of Ticket C")
    reg_data_3 = {
        "event_id": event_id,
        "ticket_type": "Repro Ticket C",
        "quantity": 1,
        "price": 0
    }
    # Send twice
    requests.post(f"{BASE_URL}/registrations", json=reg_data_3, headers=headers)
    requests.post(f"{BASE_URL}/registrations", json=reg_data_3, headers=headers)
    
    res = requests.get(f"{BASE_URL}/tickets/my", headers=headers)
    tickets_3 = res.json()
    c_count = sum(1 for t in tickets_3 if t['ticket_type'] == "Repro Ticket C")
    print(f"Ticket C Count: {c_count}")
    if c_count > 1:
        print("[BUG CONFIRMED] Duplicate tickets created for Ticket C!")

if __name__ == "__main__":
    run_repro()
