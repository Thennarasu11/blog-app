# BlogVerse — Full-stack Blog Application
Responsive blog publishing application with its existing HTML/CSS/vanilla JavaScript frontend and a Node.js, Express and MongoDB REST API.

## Features
- Responsive home, registration, login, dashboard and blog editor pages.
- MongoDB-backed users and blog posts.
- Registration with bcrypt password hashing and duplicate-email protection.
- JWT authentication in an HttpOnly cookie; protected author-only create, update and delete operations.
- Public published-blog feed, private draft access for authors, validation and centralized API errors.

## Stack
HTML5, CSS3, vanilla JavaScript, Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Helmet, CORS and express-validator.

## Requirements
Node.js 18+ and MongoDB (local or MongoDB Atlas).

## Setup
1. Clone and install:
   ```bash
   git clone https://github.com/Thennarasu11/blog-app.git
   cd blog-app
   npm install
   cd backend && npm install
   ```
2. Configure backend:
   ```bash
   cp .env.example .env
   ```
   Set `MONGODB_URI`, a random `JWT_SECRET` (32+ characters), `FRONTEND_URL` and `COOKIE_SAME_SITE`. Never commit .env.
3. Start API from `backend/`:
   ```bash
   npm run dev
   ```
4. Serve the repository root with a static server (for example VS Code Live Server at `http://127.0.0.1:5500`). Open `index.html`. Set `FRONTEND_URL` to that exact origin. The frontend API defaults to `http://localhost:5000/api`; override it before loading scripts with `window.API_BASE_URL` when deploying.

## API
All responses use JSON: `{ success, message?, data? }`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /api/health | Public | Health check |
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login; sets HttpOnly JWT cookie |
| GET | /api/auth/me | Authenticated | Current user |
| POST | /api/auth/logout | Public | Clear auth cookie |
| GET | /api/blogs | Public | List published blogs newest first |
| GET | /api/blogs/:id | Public (published) | Get blog by Mongo ID |
| POST | /api/blogs | Authenticated | Create blog |
| PUT | /api/blogs/:id | Author only | Update blog |
| DELETE | /api/blogs/:id | Author only | Delete blog |

Registration body: `{ "name": "Writer", "email": "writer@example.com", "password": "at-least-8-characters" }`.
Login body: `{ "email": "writer@example.com", "password": "..." }`.
Blog body: `{ "title": "...", "content": "At least 30 characters...", "category": "Technology", "tags": ["Node"], "status": "published" }`.

## Authentication and security
JWT is signed with `JWT_SECRET` and delivered only as an HttpOnly cookie. Frontend requests use `credentials: 'include'`; do not move the token into localStorage. HTTPS is required in production for secure cookies. Configure an exact trusted frontend origin. Helmet, rate limiting, request-size limits, validation, Mongoose schemas, bcrypt hashing and author ownership checks are enabled.

## Testing
Start MongoDB and the backend, then check `GET /api/health`. Test register/login/me, blog create/list/get/update/delete, invalid IDs and cross-user modification using Postman or curl. Automated backend tests can be added with a test database; live database and browser integration checks require your configured MongoDB URI and running frontend origin.

## Project structure
```
backend/
  config/db.js
  controllers/{authController,blogController}.js
  middleware/{asyncHandler,auth,errorHandler,validate}.js
  models/{User,Blog}.js
  routes/{authRoutes,blogRoutes}.js
  server.js
  .env.example
  package.json
css/style.css
js/app.js
index.html, login.html, register.html, dashboard.html, create-blog.html
```


## Module 03 — Database Integration (Day 9–Day 12)
The application now uses MongoDB through Mongoose for persistent users and blog posts. User passwords are hashed with bcrypt before storage. Authentication uses JWT in an HttpOnly cookie. The homepage retrieves published blog posts from `GET /api/blogs`; the authenticated dashboard retrieves the current user's posts from `GET /api/blogs/mine`. Selecting a post opens `blog-details.html?id=<MongoDB ObjectId>`, which retrieves that individual post from `GET /api/blogs/:id` and displays its title, category, author, date, tags and full content.

### Database setup
- Start MongoDB locally or create a MongoDB Atlas database.
- Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and a strong `JWT_SECRET`.
- Run `npm install` inside `backend/`, then `npm run dev`.
- Serve the frontend root with Live Server at the configured `FRONTEND_URL`.
- Verify `GET http://127.0.0.1:5000/api/health`, register an account, create a blog, confirm it appears on the homepage, and open its Read full story link.

The repository contains the integration code and setup instructions; a successful live database test requires the developer's MongoDB connection and local runtime.
