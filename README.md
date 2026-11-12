# BlogVerse — Full-Stack Blog Application

BlogVerse is a responsive blog publishing application built with HTML, CSS and vanilla JavaScript, backed by a Node.js/Express REST API and MongoDB. It supports account registration, secure login, author-owned blog management, search, category filtering, profile management and individual blog reading pages.

## Features

- Responsive landing page, registration, login, dashboard, profile, editor and blog details pages.
- MongoDB persistence through Mongoose.
- Password hashing with bcrypt.
- JWT authentication stored in an HttpOnly cookie.
- Protected dashboard/editor/profile experiences and author-only blog mutations.
- Create, read, update and delete blog posts, including drafts.
- Search across blog title, content, category and tags; category filtering.
- Centralized validation and error handling, Helmet security headers, CORS and API rate limiting.
- Render Blueprint for deploying the frontend and API together.

## Technology stack

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js 18+, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, HttpOnly cookies, bcrypt
- Security: Helmet, CORS, express-rate-limit, express-validator
- Hosting: Render (Blueprint)

## Project structure

```
blog-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/authController.js
│   ├── controllers/blogController.js
│   ├── middleware/
│   ├── models/User.js
│   ├── models/Blog.js
│   ├── routes/authRoutes.js
│   ├── routes/blogRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── css/style.css
├── js/app.js
├── js/config.js
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── profile.html
├── create-blog.html
├── blog-details.html
├── render.yaml
└── README.md
```

## Run locally

### Prerequisites

- Node.js 18 or later and npm
- MongoDB Community Server locally, or a MongoDB Atlas cluster
- A static frontend server such as VS Code Live Server

### 1. Clone the repository

```bash
git clone https://github.com/Thennarasu11/blog-app.git
cd blog-app
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` inside the `backend` folder and set:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/blogverse
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://127.0.0.1:5500
COOKIE_SAME_SITE=lax
```

For MongoDB Atlas, use the connection URI provided by your Atlas cluster. Never commit `.env` or credentials.

### 3. Start the API

From the `backend` folder:

```bash
npm run dev
```

The API runs at `http://127.0.0.1:5000`. Check `http://127.0.0.1:5000/api/health`; a healthy response reports `database: "connected"`.

### 4. Start the frontend

Serve the repository root using VS Code Live Server or another static server. Open `http://127.0.0.1:5500`. The `js/config.js` file selects the local API automatically for localhost/127.0.0.1.

If your local static server uses a different port, update `FRONTEND_URL` in `backend/.env` to the exact origin.

## Deployment to Render

The repository includes `render.yaml`, which defines two Render services: a static frontend (`blogverse-frontend`) and a Node web service (`blogverse-api`).

1. Push the repository to GitHub.
2. Sign in to Render and choose **New → Blueprint**.
3. Connect `Thennarasu11/blog-app` and select the `main` branch.
4. Review the two services in `render.yaml` and deploy the Blueprint.
5. When prompted, provide the `MONGODB_URI` value for the API service. Use a MongoDB Atlas database and allow network access from Render (Atlas network access configuration).
6. Render generates `JWT_SECRET` automatically. Keep it private.
7. The frontend config points to `https://blogverse-api.onrender.com/api` and the CORS origin is configured for `https://blogverse-frontend.onrender.com`. If Render assigns different service URLs, update `js/config.js` and the API service's `FRONTEND_URL` to the actual URLs, commit and redeploy.
8. Confirm the API health endpoint reports a connected database, then test registration, login, blog CRUD, profile update and logout on the live frontend.

Render may take a short time to wake a free service after inactivity. Do not publish a deployment URL as live until both services have finished deploying and the health check succeeds.

## API reference

All API responses are JSON in the shape `{ success, message?, data? }`.

### Health and authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API and database health |
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Login and set HttpOnly JWT cookie |
| GET | `/api/auth/me` | Authenticated | Read current profile |
| PUT | `/api/auth/me` | Authenticated | Update profile name/email |
| POST | `/api/auth/logout` | Session | Clear authentication cookie |

### Blogs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/blogs` | Public | List published blogs, newest first |
| GET | `/api/blogs?q=term&category=Technology` | Public | Search/filter published blogs |
| GET | `/api/blogs/:id` | Public for published posts | Read a blog |
| GET | `/api/blogs/mine` | Authenticated | List own posts and drafts |
| GET | `/api/blogs/mine/:id` | Authenticated owner | Read own post for editing |
| POST | `/api/blogs` | Authenticated | Create a blog |
| PUT | `/api/blogs/:id` | Author only | Update a blog |
| DELETE | `/api/blogs/:id` | Author only | Delete a blog |

Registration JSON: `{ "name": "Writer", "email": "writer@example.com", "password": "at-least-8-characters" }`.

Blog JSON: `{ "title": "A blog title", "content": "At least 30 characters of blog content...", "category": "Technology", "tags": ["Node"], "status": "published" }`.

## Security notes

- Passwords are hashed with bcrypt and are never returned by API responses.
- JWTs are held in HttpOnly cookies; frontend code does not store them in localStorage.
- Protected API routes verify JWTs and load the user from MongoDB.
- Blog update/delete endpoints enforce author ownership on the server.
- Configure an exact CORS origin and use HTTPS in production.
- Keep `backend/.env`, database credentials and JWT secrets out of Git.

## Verification checklist

After configuring MongoDB and running both services, verify:

1. Register a new user; confirm a duplicate email is rejected.
2. Login; confirm `GET /api/auth/me` succeeds.
3. Open the dashboard in a logged-out browser; it should redirect to login.
4. Create, edit, publish, draft and delete a blog as its author.
5. Confirm a second user cannot edit/delete the first user's post.
6. Verify homepage search, category filtering and the blog details page.
7. Update the profile and verify the changed name appears in the dashboard.
8. Logout and confirm protected pages redirect to login.

Automated and live integration tests require a configured MongoDB instance and deployed/local runtime; do not treat a successful Git push as proof that the hosted app is running.
