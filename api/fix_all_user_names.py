from flask import Flask
from src.config import Config
from src.database import mongo

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

print("=== CHECKING ALL USERS FOR MISSING NAMES ===\n")

all_users = list(mongo.db.users.find())
fixed_count = 0

for user in all_users:
    email = user['email']
    current_name = user.get('name', '')
    
    # Check if name is missing, empty, or 'N/A'
    if not current_name or current_name == 'N/A' or current_name.strip() == '':
        print(f"❌ FIXING: {email}")
        print(f"   Current name: '{current_name}'")
        
        # Extract name from email (before @)
        suggested_name = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
        
        # Update the database
        mongo.db.users.update_one(
            {"_id": user['_id']},
            {"$set": {"name": suggested_name}}
        )
        print(f"   ✅ Updated to: '{suggested_name}'\n")
        fixed_count += 1
    else:
        print(f"✅ OK: {email} - Name: '{current_name}'")

print(f"\n{'='*50}")
print(f"SUMMARY: Fixed {fixed_count} user(s)")
print(f"{'='*50}")

if fixed_count > 0:
    print("\n🔄 Please refresh your browser to see the changes!")
else:
    print("\n✅ All users already have names set!")
