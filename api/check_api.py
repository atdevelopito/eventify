
import requests
try:
    r = requests.get('http://localhost:5000/api/events')
    print(f"Status: {r.status_code}")
    print(f"Count: {len(r.json().get('events', []))}")
except Exception as e:
    print(f"Error: {e}")
