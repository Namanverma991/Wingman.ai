# Wingman AI — API Specification

The Wingman AI backend exposes REST endpoints under the `/api/v1` prefix. All transactional requests (except registration and login) require a bearer token in the `Authorization` header.

---

## 1. Health Checks
Check if backend service is running and database connections are healthy.

- **URL**: `/health`
- **Method**: `GET`
- **Auth**: None
- **Response**: `200 OK`
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-06-12T15:47:34Z",
    "version": "1.0.0"
  }
  ```

---

## 2. Authentication

### Register
Create a new user account.
- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "myusername",
    "password": "StrongPassword123",
    "full_name": "John Doe"
  }
  ```
- **Response**: `201 Created`

### Login
Generate access and refresh tokens.
- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "myusername",
    "password": "StrongPassword123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI...",
    "refresh_token": "eyJhbGciOiJIUzI...",
    "token_type": "bearer"
  }
  ```

---

## 3. Users

### User Profile
Fetch user subscription plan and remaining credits.
- **URL**: `/api/v1/users/me`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "id": "a2b9d0e2-63b7-4aef-ba6a-e64e528a4ad0",
    "email": "user@example.com",
    "username": "myusername",
    "full_name": "John Doe",
    "plan": "free",
    "credits_remaining": 10,
    "is_active": true
  }
  ```

---

## 4. Replies

### Generate Replies
Generate reply suggestions from LLM context models.
- **URL**: `/api/v1/replies/generate`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "platform": "whatsapp",
    "tone": "confident",
    "contact_name": "Jane Smith",
    "messages": [
      {
        "sender": "Jane Smith",
        "content": "Are you coming tonight?",
        "direction": "incoming"
      }
    ]
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "history_id": "e6f1b4c6-07fb-8e23-fead-2a8296ce8ee4",
    "replies": [
      "yea, wouldn't miss it!",
      "i'm on my way shortly",
      "of course! see you soon"
    ]
  }
  ```

### Select Reply
Log the specific suggestion chosen by the user.
- **URL**: `/api/v1/replies/select`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "history_id": "e6f1b4c6-07fb-8e23-fead-2a8296ce8ee4",
    "selected_index": 0
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true
  }
  ```

---

## 5. Usage

### Usage Summary
Fetch history log of user actions and credits spent.
- **URL**: `/api/v1/usage/summary`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  {
    "total_credits_used": 12,
    "remaining_credits": 8,
    "recent_records": [
      {
        "action": "reply_generation",
        "credits_used": 1,
        "platform": "whatsapp",
        "created_at": "2026-06-12T15:40:00Z"
      }
    ]
  }
  ```
