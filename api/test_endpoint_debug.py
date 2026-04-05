import requests

try:
    response = requests.get('http://127.0.0.1:5000/api/events?sort=-target_date&limit=5&featured=true')
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
