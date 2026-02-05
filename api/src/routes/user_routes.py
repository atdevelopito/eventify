
from flask import Blueprint, jsonify
from src.utils.decorators import token_required
from src.utils.limiter import limiter

user_bp = Blueprint('user', __name__)

@user_bp.route('/dashboard', methods=['GET'])
@token_required
@limiter.limit("60 per minute")
def dashboard(current_user):
    return jsonify({
        'message': 'Welcome to the dashboard!',
        'user': {
            'id': str(current_user['_id']),
            'email': current_user['email'],
            'name': current_user.get('name', 'N/A'),
            'role': current_user.get('role'),
            'verified': current_user.get('is_verified'),
            'is_organizer': current_user.get('is_organizer', False),
            'avatar_url': current_user.get('avatar_url'),
            'metadata': current_user.get('metadata'),
            'organization_name': current_user.get('organization_name'),
            'bio': current_user.get('bio'),
            'website': current_user.get('website'),
            'social_links': current_user.get('social_links', {})
        }
    })

@user_bp.route('/profile', methods=['PUT'])
@token_required
@limiter.limit("10 per minute")
def update_profile(current_user):
    from flask import request
    from src.database import mongo
    
    data = request.get_json()
    allowed_fields = ['name', 'organization_name', 'bio', 'website', 'social_links']
    update_data = {}
    
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]
            
    if not update_data:
        return jsonify({'message': 'No changes provided'}), 400
        
    if 'name' in update_data and not update_data['name']:
        return jsonify({'message': 'Name cannot be empty'}), 400

    mongo.db.users.update_one(
        {"_id": current_user['_id']},
        {"$set": update_data}
    )
    
    return jsonify({'message': 'Profile updated successfully', 'updated_fields': update_data})

@user_bp.route('/tickets', methods=['GET'])
@token_required
@limiter.limit("30 per minute")
def get_tickets(current_user):
    tickets = [
        {
            "id": "1",
            "event_name": "Summer Concert 2026",
            "date": "2026-07-15",
            "location": "Central Park",
            "status": "upcoming"
        },
        {
            "id": "2",
            "event_name": "Tech Conference",
            "date": "2026-03-10",
            "location": "Convention Center",
            "status": "past"
        }
    ]
    return jsonify({'tickets': tickets})

@user_bp.route('/profile-picture', methods=['POST'])
@token_required
@limiter.limit("10 per minute")
def upload_profile_picture(current_user):
    """Upload or update user's profile picture to local storage"""
    from flask import request
    from src.database import mongo
    from werkzeug.utils import secure_filename
    from PIL import Image
    import os
    import glob
    
    file_key = 'image' if 'image' in request.files else 'file'
    
    if file_key not in request.files:
        return jsonify({"message": "No file provided"}), 400
    
    file = request.files[file_key]
    
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400
    
    # Validate file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
        return jsonify({"message": "Invalid file type"}), 400
    
    try:
        # Ensure upload directory exists
        from flask import current_app
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'avatars')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Convert to WebP
        img = Image.open(file.stream)
        
        # Resize to 800x800 max
        if max(img.size) > 800:
            img.thumbnail((800, 800), Image.Resampling.LANCZOS)
        
        # Convert to RGB
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Use user ID as filename (this replaces old image automatically)
        user_id = str(current_user['_id'])
        filename = f"{user_id}.webp"
        file_path = os.path.join(upload_dir, filename)
        
        # Delete old file if it exists (in case of different extension)
        for old_file in glob.glob(os.path.join(upload_dir, f"{user_id}.*")):
            if old_file != file_path:
                try:
                    os.remove(old_file)
                    print(f"Deleted old avatar: {old_file}")
                except:
                    pass
        
        # Save as WebP
        img.save(file_path, format='WEBP', quality=85)
        
        print(f"[AVATAR] Saved to: {file_path}")
        
        # Create URL path
        avatar_url = f"/uploads/avatars/{filename}"
        
        print(f"[AVATAR] URL: {avatar_url}")
        
        # Update user document
        mongo.db.users.update_one(
            {"_id": current_user['_id']},
            {"$set": {"avatar_url": avatar_url}}
        )
        
        return jsonify({
            "message": "Profile picture updated successfully",
            "avatar_url": avatar_url
        }), 200
        
    except Exception as e:
        print(f"Profile picture upload error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Upload failed: {str(e)}"}), 500

@user_bp.route('/profile-picture', methods=['DELETE'])
@token_required
@limiter.limit("10 per minute")
def delete_profile_picture(current_user):
    """Remove user's profile picture"""
    from src.database import mongo
    
    try:
        mongo.db.users.update_one(
            {"_id": current_user['_id']},
            {"$unset": {"avatar_url": ""}}
        )
        
        return jsonify({"message": "Profile picture removed successfully"}), 200
    except Exception as e:
        print(f"Error removing profile picture: {e}")
        return jsonify({"message": "Failed to remove profile picture"}), 500
