"""
Simple test to check if ticket endpoint works
"""
import requests
import json

# First, let's check what tickets exist
print("🔍 Testing ticket endpoint...\n")

# You'll need to replace these with actual values
BASE_URL = "http://localhost:5000/api"

# Test without auth first to see the error
print("1. Testing GET /tickets/my without auth:")
response = requests.get(f"{BASE_URL}/tickets/my")
print(f"   Status: {response.status_code}")
print(f"   Response: {response.text[:200]}\n")

print("To test with auth, you need to:")
print("1. Login via the frontend")
print("2. Get your token from localStorage")
print("3. Run: curl -H 'Authorization: Bearer YOUR_TOKEN' http://localhost:5000/api/tickets/my")
