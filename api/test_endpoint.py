import sys
import requests

# Test the /registrations/my endpoint directly
url = "http://127.0.0.1:5000/api/registrations/my"

# You'll need to get a valid token first
# For now, let's just test if the endpoint responds
try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
