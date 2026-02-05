import requests
import json
import sys
import time

BASE_URL = "http://127.0.0.1:5000/api"

def run_test():
    print("🚀 Starting Scan Flow Verification...")
    
    # 1. Register ORGANIZER
    timestamp = int(time.time())
    org_email = f"org_{timestamp}@scan.com"
    print(f"1. Registering ORGANIZER: {org_email}")
    org_res = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Organizer Bob", "email": org_email, "password": "password123", "role": "organizer"
    })
    org_token = org_res.json().get('token')
    org_headers = {"Authorization": f"Bearer {org_token}", "Content-Type": "application/json"}
    
    # 2. Register ATTENDEE
    att_email = f"attendee_{timestamp}@scan.com"
    print(f"2. Registering ATTENDEE: {att_email}")
    att_res = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Attendee Alice", "email": att_email, "password": "password123", "role": "user"
    })
    att_token = att_res.json().get('token')
    att_headers = {"Authorization": f"Bearer {att_token}", "Content-Type": "application/json"}
    
    # 3. Organizer creates Event
    print("3. Organizer creating event...")
    event_res = requests.post(f"{BASE_URL}/events", json={
        "title": "Scan Test Event", "date": "2026-12-31", "time": "20:00", 
        "tickets": [{"name": "General", "price": 0, "quantity": 100, "type": "free"}]
    }, headers=org_headers)
    event_id = event_res.json().get('id')
    print(f"   Event ID: {event_id}")
    
    # 4. Attendee registers (Free = Instant Ticket)
    print("4. Attendee getting ticket...")
    reg_res = requests.post(f"{BASE_URL}/registrations", json={
        "event_id": event_id, "ticket_type": "General", "quantity": 1, "price": 0, "payment_method": "n/a"
    }, headers=att_headers)
    ticket_id = reg_res.json()['tickets'][0] # ID in DB
    
    # Get Ticket Details for QR Token
    ticket_details = requests.get(f"{BASE_URL}/tickets/{ticket_id}", headers=att_headers).json()
    qr_token = ticket_details['qr_token']
    print(f"   Ticket ID: {ticket_id}")
    print(f"   QR Token: {qr_token[:10]}...")
    
    # 5. Organizer SCANS Ticket (First Scan)
    print("\n5. 🟢 Organizer scanning ticket (First Time)...")
    scan_res = requests.post(f"{BASE_URL}/tickets/validate", json={"qr_token": qr_token}, headers=org_headers)
    scan_data = scan_res.json()
    print(f"   Status: {scan_res.status_code}")
    print(f"   Response: {json.dumps(scan_data, indent=2)}")
    
    if not scan_data.get('valid'):
        print("❌ FAILURE: Valid ticket was rejected!")
        print(f"   Reason: {scan_data.get('message')}")
        return False
        
    # 6. Organizer SCANS Ticket AGAIN (Double Scan)
    print("\n6. 🟡 Organizer scanning ticket AGAIN (Idempotency Check)...")
    scan_res2 = requests.post(f"{BASE_URL}/tickets/validate", json={"qr_token": qr_token}, headers=org_headers)
    scan_data2 = scan_res2.json()
    print(f"   Status: {scan_res2.status_code}")
    print(f"   Response: {json.dumps(scan_data2)}")
    
    # Should be Valid=False, Message="Ticket already used"
    if scan_data2.get('valid') is True:
        print("❌ FAILURE: Double scan was accepted as valid!")
        return False
        
    if "already used" not in scan_data2.get('message', '').lower():
         print("❌ FAILURE: Wrong error message for used ticket!")
         return False
         
    # 7. Attendee tries to scan (Unauthorized)
    print("\n7. 🔴 Random user trying to scan (Security Check)...")
    scan_res3 = requests.post(f"{BASE_URL}/tickets/validate", json={"qr_token": qr_token}, headers=att_headers)
    scan_data3 = scan_res3.json()
    print(f"   Status: {scan_res3.status_code} (Expected 403)")
    print(f"   Response: {json.dumps(scan_data3, indent=2)}")
    
    if scan_res3.status_code != 403:
         print("❌ FAILURE: Non-organizer was allowed to scan!")
         print(f"   Got status {scan_res3.status_code} instead of 403")
         return False

    print("\n🎉 Scan Flow Verification COMPLETE!")
    return True

if __name__ == "__main__":
    if run_test():
        sys.exit(0)
    else:
        sys.exit(1)
