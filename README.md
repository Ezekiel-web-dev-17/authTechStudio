# AuthTechStudio – Backend Authentication & CRUD API

## 📌 Project Description
AuthTechStudio is a RESTful API built with **Node.js**, **Express.js**, and **MongoDB** that demonstrates user authentication, authorization, and basic CRUD functionality.  
The API supports role-based access control, allowing admins to manage resources while regular users have restricted permissions.

---

## 🚀 Features

### 🔐 Authentication
- User Registration with password hashing using **bcrypt**.
- Secure login with **JWT** token generation.
- Token validation middleware for protected routes.
- Graceful handling of expired or invalid tokens.

### 🛡 Authorization
- Role-based access control (`user` / `admin`).
- Only admins can create, update, or delete resources.
- Public read access for certain endpoints.

### 📦 CRUD Operations
- Example resource: **Posts** (can be changed to any entity).
    - **Create**: Admin only.
    - **Read**: Public access.
    - **Update**: Admin only.
    - **Delete**: Admin only.

## 🛠 Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose)
- **bcrypt** for password hashing
- **JWT** for authentication

---

## 📂 Project Structure
authTechStudio/
├── config/         # DB & environment configs
├── controllers/    # Route logic
├── database/       # DB connection
├── middleware/     # JWT & role middlewares
├── model/          # Mongoose schemas
├── routes/         # API routes
├── app.js          # Entry point
└── package.json

---

## ⚙ Installation & Setup

### Prerequisites
- Node.js v16+
- MongoDB Atlas or local MongoDB instance

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/Ezekiel-web-dev-17/authTechStudio.git
cd authTechStudio

# 2. Install dependencies
npm install

# 3. Create a .env file
PORT=3000
DB_URI="mongodb+srv://<username>:<password>@<cluster-url>/<dbname>"
JWT_SECRET="yoursecret"
JWT_EXPIRES_IN="7d"

# 4. Start the server
npm start
```
---
📡 API Endpoints

Register as a new user via **/api/auth/register**.  
Login at **/api/auth/login** to receive a JWT token.

### Authentication
| Method | Endpoint            | Access      | Description        |
|--------|---------------------|-------------|--------------------|
| POST   | /api/auth/register  | Public      | Register a new user|
| POST   | /api/auth/login     | Public      | Login & get JWT    |
| POST   | /api/posts          | Admin only  | Create a new post  |
| GET    | /api/posts          | Public      | Get all posts      |
| GET    | /api/posts/:id      | Public      | Get single post    |
| PUT	   | /api/posts/:id      | Admin       | Update a post      |
| DELETE | /api/posts/:id      | Admin       | Delete a post      |

---

🔑 Authentication & Role-Based Access
Register as a new user via /api/auth/register.

Login at /api/auth/login to receive a JWT token.

Include token in Authorization: Bearer <token> header for protected routes.

Admin privileges are required for create, update, and delete operations.

🧪 Error Handling
Centralized error middleware for consistent JSON error responses.

Uses HTTP status codes:
200 – OK
201 – Created
400 – Bad Request
401 – Unauthorized
403 – Forbidden
404 – Not Found
500 – Server Error

📄 API Documentation
[Postman Collection Link](https://documenter.getpostman.com/view/41487666/2sB3BGHAD8)

🌍 Deployment
Hosted on: https://authtechstudio.onrender.com

🏆 Evaluation Criteria Checklist
- [x] JWT Authentication  
- [x] Role-Based Authorization  
- [x] Full CRUD with Admin Restrictions  
- [x] Centralized Error Handling  
- [x] Postman Documentation  
- [x] Hosted Link
 
