
import requests
try:
    r = requests.get('http://localhost:3000/')
    print(f"Status: {r.status_code}")
    print(f"Text snippet: {r.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
