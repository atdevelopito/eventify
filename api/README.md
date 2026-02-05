
# Eventify API

A secure Flask REST API for the Eventify ticketing platform.

## Features
- **Authentication**: JWT-based auth with secure password hashing (Bcrypt).
- **Signup Flow**: Email verification with 7-day expiry codes.
- **Password Reset**: Secure one-time token flow via email.
- **Security**: Rate limiting, input validation, secure headers.
- **Database**: MongoDB integration.
- **Emails**: Transactional emails via Resend SMTP.

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory (or use the one in `api/`):
   ```env
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secure_secret
   RESEND_SMTP_HOST=smtp.resend.com
   RESEND_SMTP_PORT=465
   RESEND_SMTP_USER=resend
   RESEND_SMTP_PASS=your_resend_api_key
   ```

3. **Run the Server**:
   ```bash
   python app.py
   ```
   Server runs on `http://127.0.0.1:5000`.

## API Endpoints

### Auth

- **Signup**
  - **URL**: `/api/auth/signup`
  - **Method**: `POST`
  - **Body**: `{ "email": "user@example.com", "password": "password123" }`
  - **Response**: `{ "message": "User created...", "user_id": "..." }`

- **Verify Account**
  - **URL**: `/api/auth/verify`
  - **Method**: `POST`
  - **Body**: `{ "email": "user@example.com", "code": "123456" }`
  - **Response**: `{ "message": "User verified successfully" }`

- **Login**
  - **URL**: `/api/auth/login`
  - **Method**: `POST`
  - **Body**: `{ "email": "user@example.com", "password": "password123" }`
  - **Response**: `{ "token": "jwt_token...", "user": { ... } }`

- **Forgot Password**
  - **URL**: `/api/auth/forgot-password`
  - **Method**: `POST`
  - **Body**: `{ "email": "user@example.com" }`
  - **Response**: `{ "message": "Password reset link sent..." }`

- **Reset Password**
  - **URL**: `/api/auth/reset-password`
  - **Method**: `POST`
  - **Body**: `{ "token": "reset_token_from_email", "new_password": "new_password123" }`
  - **Response**: `{ "message": "Password reset successfully" }`

- **Dashboard (Protected)**
  - **URL**: `/api/auth/dashboard`
  - **Method**: `GET`
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "message": "Welcome...", "user": { ... } }`
