import json
try:
    with open('events.json', 'r') as f:
        data = json.load(f)
        with open('debug_url.txt', 'w') as out:
            for e in data.get('events', []):
                if 'Robotics' in e.get('title', ''):
                    out.write(f"TITLE: {e.get('title')}\n")
                    out.write(f"BG_URL: {e.get('background_image_url')}\n")
                    out.write(f"COVER: {e.get('cover_image')}\n")
                    out.write("-" * 20 + "\n")
except Exception as e:
    print(e)
