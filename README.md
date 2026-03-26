# You Shall Not Inject — Backend API

A secure, production-ready backend service for teaching prompt injection defense through interactive challenges. Built with Node.js, Express, MongoDB, and JWT authentication.

## Overview

This API powers the prompt injection learning platform, managing user authentication, challenge progression, and submission tracking. The backend enforces strict security guardrails to prevent prompt leakage and unauthorized access.

## Features

- **User Authentication** — JWT-based signup/login with bcrypt password hashing
- **Challenge Management** — Five progressive levels teaching prompt injection techniques
- **Progress Tracking** — Persistent user progress with hint usage limits
- **Submission Validation** — Server-side regex matching for challenge answers
- **Security Hardening** — No prompt/secret leakage in responses, admin-only endpoints, input validation
- **Testing Ready** — E2E mode for automated testing without JWT secrets

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Validation:** Express middleware + Mongoose schema validation
- **Testing:** API testing via Postman/Insomnia
- **Environment:** dotenv for config management

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB local instance or Atlas URI
- `.env` file with required variables

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/prompt-injection
# OR for Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/prompt-injection

# JWT
JWT_SECRET=your_very_secure_secret_key_min_32_chars_recommended

# E2E Testing (optional, leave unset for production)
E2E_MODE=false
```

**Important:** Outside E2E_MODE, JWT_SECRET is required and validation is enforced at runtime.

### Running the Server

```bash
# Development mode (auto-reload with nodemon)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:3000` by default.

## API Routes

### Authentication

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 201
{
  "token": "eyJhbGc...",
  "user": { "id": "...", "email": "user@example.com", "progressLevel": 0 }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200
{
  "token": "eyJhbGc...",
  "user": { "id": "...", "email": "user@example.com", "progressLevel": 1 }
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response: 200
{ "message": "Logged out successfully" }
```

### Challenges

#### Get All Challenges
```
GET /api/challenges

Response: 200
[
  {
    "id": "...",
    "level": 1,
    "title": "The Encoding Quest",
    "description": "...",
    "explanation": "..."
  },
  ...
]
```

**Note:** Challenge responses do NOT include `systemPrompt` or secret fields.

#### Get Single Challenge
```
GET /api/challenges/:id
Authorization: Bearer <token>

Response: 200
{
  "id": "...",
  "level": 1,
  "title": "...",
  "description": "...",
  "explanation": "..."
}
```

#### Create Challenge (Admin Only)
```
POST /api/challenges
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "level": 1,
  "title": "The Encoding Quest",
  "description": "Learn to encode your prompt...",
  "systemPrompt": "You are a security trainer...",
  "secretPassword": "base64_encoded",
  "explanation": "The key was to use base64 encoding..."
}

Response: 201
{ "id": "...", "level": 1, ... }
```

#### Update Challenge (Admin Only)
```
PUT /api/challenges/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

Response: 200
{ ... updated challenge ... }
```

#### Delete Challenge (Admin Only)
```
DELETE /api/challenges/:id
Authorization: Bearer <admin_token>

Response: 200
{ "message": "Challenge deleted" }
```

### Submissions

#### Submit Challenge Answer
```
POST /api/submissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "challengeId": "...",
  "userPrompt": "base64_encoded"
}

Response: 200 (success)
{
  "success": true,
  "message": "Challenge passed!",
  "nextTechniqueHint": "Next level teaches semantic reframing..."
}

Response: 200 (failure)
{
  "success": false,
  "message": "Incorrect answer. Try again."
}
```

### Progress

#### Get User Progress
```
GET /api/progress/:userId
Authorization: Bearer <token>

Response: 200
{
  "userId": "...",
  "progressLevel": 3,
  "hintsUsed": 1,
  "completedChallenges": [1, 2, 3],
  "lastSubmission": "2026-03-26T13:05:00Z"
}
```

#### Beat (Progress Update, Admin Only)
```
POST /api/progress/beat/:userId
Authorization: Bearer <admin_token>

Response: 200
{ "progressLevel": 4, "hintsUsed": 1 }
```

## Security Design

### What We Protect

- **No Prompt Leakage** — Challenge responses never include `systemPrompt` or secret fields
- **Admin Endpoints** — Challenge CRUD and progress reset require admin auth
- **Input Validation** — All routes validate email format, password strength, and payload shape
- **Password Hashing** — bcrypt with 10 rounds (non-reversible)
- **JWT Secret** — Enforced outside E2E_MODE; required in `.env` for production

### E2E Mode

For automated testing, set `E2E_MODE=true` in `.env` to bypass JWT secret requirement. Never use in production.

### Error Handling

All errors return centralized, safe messages:

```json
{
  "error": "User-friendly message",
  "status": 400
}
```

Sensitive details (stack traces, database errors) are logged but never exposed to clients.

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  passwordHash: String (bcrypt),
  progressLevel: Number (0-5),
  hintsUsed: Number (0-3),
  createdAt: Date,
  updatedAt: Date
}
```

### Challenge Model
```javascript
{
  _id: ObjectId,
  level: Number (1-5, unique),
  title: String,
  description: String,
  systemPrompt: String, // NOT returned in API responses
  secretPassword: String, // NOT returned in API responses
  explanation: String,
  nextTechniqueHint: String,
  createdAt: Date
}
```

### Submission Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  challengeId: ObjectId (ref: Challenge),
  userPrompt: String,
  llmResponse: String,
  success: Boolean,
  createdAt: Date
}
```

### Progress Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  progressLevel: Number,
  hintsUsed: Number,
  completedChallenges: [ObjectId],
  lastSubmission: Date
}
```

## Testing

### Manual Testing (Postman/Insomnia)

1. **Sign up** — POST `/api/auth/signup` with email/password
2. **Login** — POST `/api/auth/login`, copy the returned token
3. **Set Auth header** — `Authorization: Bearer <token>` for all protected routes
4. **Get challenges** — GET `/api/challenges`
5. **Submit answer** — POST `/api/submissions` with `challengeId` and `userPrompt`
6. **Check progress** — GET `/api/progress/:userId`

### Automated Testing (E2E)

Enable E2E_MODE in `.env`, then run from the frontend directory:
```bash
npm run e2e
```

Frontend Playwright tests exercise the full auth → challenge → submission flow.

## Code Organization

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── runtime.js         # JWT secret validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Challenge.js
│   │   ├── Submission.js
│   │   └── Progress.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js    # Centralized error handling
│   ├── routes/
│   │   ├── auth.js
│   │   ├── challenges.js
│   │   ├── submissions.js
│   │   └── progress.js
│   ├── services/
│   │   ├── authService.js     # Password hashing, JWT creation
│   │   ├── challengeService.js # Challenge logic
│   │   └── submissionService.js # Answer validation
│   └── server.js              # Express app entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Key Design Decisions

### Why Regex for Answer Validation?

We use regex matching (not LLM evaluation) for two reasons:
1. **Deterministic** — Same answer always produces same result (testable, fair)
2. **Teachable** — Students learn exact techniques, not vague "good enough" approximations

### Why JWT Over Sessions?

JWT tokens are stateless, making the API scalable and frontend-agnostic. No session store overhead.

### Why Mongoose Over Raw MongoDB?

Mongoose provides:
- Built-in validation and type safety
- Middleware hooks for password hashing
- Relationship management (refs)
- Clean, readable schema definitions

## Deployment

See the main project README for full deployment steps. Backend can run on any Node.js hosting (Heroku, Render, AWS, Azure, etc.).

Key vars for production:
- `MONGODB_URI` — Use Atlas or managed Mongo service
- `JWT_SECRET` — Use a cryptographically secure random string (min 32 chars)
- `NODE_ENV=production`

## Contributing

Submit feature requests or bug reports via GitHub Issues. Pull requests welcome!

## License

MIT License — See LICENSE file in the project root.

## Support

Questions? Check the main project README or open an issue on GitHub.
