🚀 MERN Stack Project – Setup & Documentation

A complete MERN stack project using MongoDB, Express, React, Node.js along with AI, Video, Judge0, Cloudinary, Redis, and full authentication flow.

🧩 Prerequisites

Before running the project, ensure the following are installed:

Node.js (LTS version)

MongoDB Atlas account

Redis (local or hosted)

Postman – API testing

VS Code

Git

📥 1. Clone the Repository
git clone <your-repo-url>
cd <project-folder>

🔧 Backend Setup
📁 2. Navigate to Backend
cd backend

📦 Install Backend Dependencies
npm install

⚙️ Create Environment Variables

Create a .env file:

touch .env


Paste the following:

PORT=
DB_CONNECT_STRING=
JWT_KEY=
REDIS_PASS=
JUDGE0_KEY=
GEMINI_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

🔐 Need a secure JWT key?

Generate a 32-character random string:
https://random.org/passwords/?num=1&len=32&format=plain&rnd=new

🚀 Start Backend
npm run dev


Ensure nodemon is installed globally:
npm install -g nodemon
Or run using plain node:
node index.js

🎨 Frontend Setup
📁 3. Navigate to Frontend
cd ../frontend

📦 Install Frontend Dependencies
npm install

🌐 Start Frontend
npm run dev

Default URLs:

Frontend (Vite): http://localhost:5173

Backend: http://localhost:3000


📌 API Endpoints — Full Description

Below is a complete breakdown of all API endpoints grouped by modules.

1. User API

Base URL: /api/user

POST /login

Authenticates a user.

Returns a JWT token.

Access: Public

POST /register

Registers a new user with basic credentials.

Access: Public

POST /adminregister

Creates a new admin account with elevated permissions.

Access: Admin

POST /logout

Logs out the user by clearing the authentication token/session.

Access: Authenticated User

DELETE /deleteprofile

Permanently deletes the logged-in user's profile.

Access: Authenticated User

GET /checkauth

Validates the user's JWT token and returns user details.

Access: Authenticated User

2. Problem API

Base URL: /api/problem

Admin Endpoints
POST /create

Creates a new coding problem (title, description, difficulty, testcases).

Access: Admin

GET /

Retrieves all problems available in the platform.

Access: Admin

PUT /update/:id

Updates an existing problem using its ID.

Access: Admin

DELETE /delete/:id

Deletes a problem permanently by its ID.

Access: Admin

User Endpoints
POST /submit/:id

Submits solution for a specific problem.

Judged using Judge0 API.

Access: Authenticated User

GET /solved

Fetches all problems solved by the current user.

Access: Authenticated User

GET /

Retrieves all problems visible to users.

Access: Public / Authenticated

GET /:id

Retrieves a specific problem by its ID.

Access: Public / Authenticated

3. Submission API

Base URL: /api/submission

POST /submit/:id

Submits the final answer for a problem.

Stores the result in the database.

Access: Authenticated User

POST /run/:id

Runs code without submitting (Judge0 API).

Used for testing.

Access: Authenticated User

4. AI API

Base URL: /api/ai

POST /chat

AI chat powered by Gemini API.

Helps users with hints and explanations.

Access: Authenticated User

5. Video API

Base URL: /api/video

POST /create

Creates a video-related resource (session, object, metadata).

Access: Authenticated User

POST /save

Saves video details (Cloudinary URL, metadata) to the database.

Access: Authenticated User

DELETE /delete/:id

Deletes a video using its ID.

Access: Authenticated User


📁 Final Project Structure
project-folder/
│
├── backend/
│   ├── .env
│   ├── package.json
│   └── src/
│       └── ...
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── index.html
│       └── ...
│
└── README.md