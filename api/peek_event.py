import json
try:
    with open('events.json', 'r') as f:
        data = json.load(f)
        for e in data.get('events', []):
            if 'Robotics' in e.get('title', ''):
                print(f"COVER_IMAGE: {e.get('cover_image')}")
                print(f"BG_IMAGE: {e.get('background_image_url')}")
except Exception as e:
    print(e)
