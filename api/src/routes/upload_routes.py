from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
import uuid
from PIL import Image
import io

upload_bp = Blueprint('upload_bp', __name__)

# Base upload directory
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_dirs():
    """Create upload directories if they don't exist"""
    dirs = [
        UPLOAD_FOLDER,
        os.path.join(UPLOAD_FOLDER, 'avatars'),
        os.path.join(UPLOAD_FOLDER, 'events')
    ]
    for dir_path in dirs:
        os.makedirs(dir_path, exist_ok=True)

def convert_to_webp(file_stream, max_size=1200):
    """Convert image to WebP format and return as bytes"""
    try:
        img = Image.open(file_stream)
        
        # Resize if too large (maintain aspect ratio)
        if max(img.size) > max_size:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save as WebP to bytes buffer
        output = io.BytesIO()
        img.save(output, format='WEBP', quality=85, method=6)
        output.seek(0)
        return output
    except Exception as e:
        print(f"Error converting image to WebP: {e}")
        raise

@upload_bp.route('', methods=['POST'], strict_slashes=False)
def upload_file():
    """Upload file to local storage - supports both event and avatar uploads"""
    print(f"[UPLOAD] Received upload request")
    print(f"[UPLOAD] Request files: {list(request.files.keys())}")
    print(f"[UPLOAD] Request form: {dict(request.form)}")
    
    ensure_upload_dirs()
    
    # Check for 'image' or 'file' in request
    file_key = 'image' if 'image' in request.files else 'file'
    
    if file_key not in request.files:
        print(f"[UPLOAD] ERROR: No file part found")
        return jsonify({"error": "No file part"}), 400
    
    file = request.files[file_key]
    print(f"[UPLOAD] Filename: {file.filename}")
    
    if file.filename == '':
        print(f"[UPLOAD] ERROR: Empty filename")
        return jsonify({"error": "No selected file"}), 400
    
    if not file or not allowed_file(file.filename):
        print(f"[UPLOAD] ERROR: File type not allowed")
        return jsonify({"error": "File type not allowed"}), 400
    
    try:
        # Determine upload type from form data (default to 'events')
        upload_type = request.form.get('type', 'events')  # 'avatars' or 'events'
        
        print(f"[UPLOAD] Upload type: {upload_type}")
        
        # Convert image to WebP
        webp_stream = convert_to_webp(file.stream)
        print(f"[UPLOAD] Conversion successful")
        
        # Generate unique filename
        original_name = secure_filename(file.filename)
        name_without_ext = os.path.splitext(original_name)[0]
        unique_filename = f"{name_without_ext}_{uuid.uuid4().hex[:8]}.webp"
        
        # Determine subdirectory
        if upload_type == 'avatars':
            subdir = 'avatars'
        else:
            subdir = 'events'
        
        # Full file path
        file_path = os.path.join(UPLOAD_FOLDER, subdir, unique_filename)
        
        print(f"[UPLOAD] Saving to: {file_path}")
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(webp_stream.read())
        
        # Return path that frontend can use
        url_path = f"/uploads/{subdir}/{unique_filename}"
        
        print(f"[UPLOAD] Upload successful! Path: {url_path}")
        
        return jsonify({"url": url_path}), 200
        
    except Exception as e:
        print(f"[UPLOAD] ERROR: Upload failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500
