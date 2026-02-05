import requests
import json

try:
    response = requests.get('http://localhost:5000/api/events?sort=-target_date&limit=5')
    data = response.json()
    events = data.get('events', [])
    with open('debug_output.json', 'w') as f:
        json.dump(events, f, indent=2)
    print("Dumped to debug_output.json")
except Exception as e:
    with open('debug_output.txt', 'w') as f:
        f.write(str(e))
