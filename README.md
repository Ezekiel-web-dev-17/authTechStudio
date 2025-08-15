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
- MongoDB Atlas

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

Register as a new user via **/api/v1/auth/sign-up**.  
Login at **/api/v1/auth/sign-in** to receive a JWT token.

### Authentication
| Method | Endpoint                       | Access     | Description             |
|--------|--------------------------------|------------|-------------------------|
| GET    | /api/v1/users/                 | Admin  | Get all users           |
| GET    | /api/v1/users/:id              | Protected  | Get user by id          |
| GET    | /api/v1/posts/                 | Public  | Get all posts           |
| PATCH  | /api/v1/users/edit/:id         | Protected | Edit a user profile     |
| PATCH	 | /api/v1/posts/edit/:id       | Protected / Admin | Edit a post           |
| POST   | /api/v1/auth/sign-up           | Public     | Register a new user     |
| POST   | /api/v1/auth/sign-in           | Public     | Login & get JWT         |
| POST   | /api/v1/auth/logout           | Protected | Logs out a user       |
| POST   | /api/v1/auth/refresh-token           | Public  | Create a new Access token       |
| POST   | /api/v1/posts/create           | Protected  | Create a new post       |
| PUT	 | /api/v1/posts/update/:id       | Protected | Update a post           |
| PUT	 | /api/v1/posts/views/:id        | Public  | Update post's views     |
| DELETE | /api/v1/posts/delete/:id       | Protected  | Delete a post by author |
| DELETE | /api/v1/posts/admin/delete/:id | Admin only | Delete a post by Admin  |
| DELETE | /api/v1/users/delete/:id       | Admin only | Delete a user           |

---

🔑 Authentication & Role-Based Access
Register as a new user via /api/v1/auth/register.

Login at /api/v1/auth/login to receive a JWT token.

Include token in Authorization: Bearer <token> header for Protected and Admin only routes.

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
[Postman Collection Link]https://documenter.getpostman.com/view/41487666/2sB3BHk8pY

🌍 Deployment
Hosted on: (https://authtechstudio.onrender.com)

🏆 Evaluation Criteria Checklist
- [x] JWT Authentication  
- [x] Role-Based Authorization  
- [x] Full CRUD with Admin Restrictions  
- [x] Centralized Error Handling  
- [x] Postman Documentation  
- [x] Hosted Link
 
