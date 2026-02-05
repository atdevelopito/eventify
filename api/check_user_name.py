from flask import Flask
from src.config import Config
from src.database import mongo

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

# Find user by email
email = "linkonw47@gmail.com"
user = mongo.db.users.find_one({"email": email})

if user:
    print(f"✅ User found: {user['email']}")
    print(f"   Current name: '{user.get('name', 'NOT SET')}'")
    print(f"   User ID: {user['_id']}")
    print(f"   Is verified: {user.get('is_verified', False)}")
    print(f"   Is organizer: {user.get('is_organizer', False)}")
    print(f"   Avatar URL: {user.get('avatar_url', 'NOT SET')}")
    
    # Check if name is missing, empty, or 'N/A'
    current_name = user.get('name', '')
    if not current_name or current_name == 'N/A' or current_name.strip() == '':
        print(f"\n⚠️  NAME IS MISSING OR INVALID: '{current_name}'")
        print("\nFIXING: Setting name to email username...")
        
        # Extract name from email (before @)
        suggested_name = email.split('@')[0].replace('.', ' ').title()
        
        # Update the database
        mongo.db.users.update_one(
            {"_id": user['_id']},
            {"$set": {"name": suggested_name}}
        )
        print(f"✅ Name updated to: '{suggested_name}'")
        print("\n🔄 Please refresh your browser to see the change!")
    else:
        print(f"\n✅ Name is set correctly: '{current_name}'")
else:
    print(f"❌ User with email {email} not found!")

print("\n\n=== ALL USERS IN DATABASE ===")
all_users = mongo.db.users.find()
for u in all_users:
    name_display = u.get('name', 'NOT SET')
    if not name_display or name_display == 'N/A':
        name_display = f"❌ {name_display}"
    else:
        name_display = f"✅ {name_display}"
    print(f"Email: {u['email']:<30} Name: {name_display}")
