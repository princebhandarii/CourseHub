Live : https://course-hub-peach.vercel.app/

# 🎓 CourseHub — Full-Stack MERN Course Selling Platform

A production-ready, modern course selling platform built with the MERN stack. Features a beautiful black & white minimal UI with dark mode, admin dashboard, video player, progress tracking, reviews, wishlist, and more.

---

## 📸 Features

### 🛡️ Admin Panel
- Modern sidebar dashboard with collapse animation
- Analytics with Recharts (revenue, enrollments, user growth)
- Full course CRUD — add/edit/delete courses
- Upload course thumbnail & section videos
- Add learning outcomes, requirements, tags
- Manage users — create, block/unblock, delete
- Toggle course publish/draft status
- Dark/light mode

### 👤 User Panel
- Browse & search courses with filters
- Course detail page with curriculum preview
- Video player with progress tracking
- Wishlist, My Courses, Continue Learning
- Star ratings & reviews
- User profile editor with avatar upload
- Forgot password / OTP email verification

### 🔐 Authentication
- Separate admin & user login/signup flows
- JWT-based authentication with refresh
- Role-based route protection
- Admin account creation requires a secret key
- Email OTP verification
- Forgot/reset password via email

---

## 🛠️ Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS          |
| State       | Context API (Auth + Theme)              |
| Routing     | React Router DOM v6                     |
| HTTP        | Axios with interceptors                 |
| Charts      | Recharts                                |
| Icons       | Lucide React                            |
| Backend     | Node.js + Express.js                    |
| Database    | MongoDB + Mongoose                      |
| Auth        | JWT + bcryptjs                          |
| File Upload | Multer                                  |
| Email       | Nodemailer                              |
| Toasts      | react-hot-toast                         |

---

## 📁 Folder Structure

```
course-platform/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route logic
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── adminController.js
│   │   ├── actionsController.js  # Enrollments, Progress, Reviews, Wishlist
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT protect + adminOnly
│   │   ├── errorHandler.js
│   │   └── upload.js        # Multer config
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Section.js
│   │   ├── Video.js
│   │   └── index.js         # Enrollment, Wishlist, Progress, Review
│   ├── routes/              # All Express routers
│   ├── utils/
│   │   └── sendEmail.js
│   ├── uploads/             # Stored files (gitignored)
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── common/      # Navbar, Footer, CourseCard
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Courses.jsx
    │   │   ├── CourseDetail.jsx
    │   │   ├── Login.jsx / Signup.jsx
    │   │   ├── About.jsx / Contact.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminLayout.jsx
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── ManageCourses.jsx
    │   │   │   ├── AddEditCourse.jsx
    │   │   │   ├── ManageUsers.jsx
    │   │   │   ├── Analytics.jsx
    │   │   │   └── AdminSettings.jsx
    │   │   └── user/
    │   │       ├── MyCourses.jsx
    │   │       ├── WatchCourse.jsx
    │   │       ├── Wishlist.jsx
    │   │       ├── UserProfile.jsx
    │   │       └── ContinueLearning.jsx
    │   ├── services/
    │   │   └── api.js       # Axios instance + service helpers
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css        # Tailwind + custom classes
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all
```

Or manually:
```bash
cd backend  && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Copy and fill in your values
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/courseplatform
JWT_SECRET=your_long_random_secret
ADMIN_SECRET=your_admin_creation_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas — paste connection string in MONGO_URI
```

### 4. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev     # runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev     # runs on http://localhost:5173
```

### 5. Create First Admin Account

Visit `http://localhost:5173/admin/signup` and enter:
- Your name, email, password
- The `ADMIN_SECRET` value from your `.env` file

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/admin/register` | Admin registration (requires secret) |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT  | `/api/auth/reset-password/:token` | Reset password |
| GET  | `/api/auth/me` | Get current user |

### Courses (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List with search/filter/pagination |
| GET | `/api/courses/:id` | Single course with sections & videos |
| GET | `/api/courses/categories` | All categories |

### Courses (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses/admin/all` | All courses incl. drafts |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course + files |
| PATCH | `/api/courses/:id/publish` | Toggle publish |
| POST | `/api/courses/:id/sections` | Add section |
| POST | `/api/courses/:id/sections/:sId/videos` | Upload video |
| DELETE | `/api/courses/:id/sections/:sId/videos/:vId` | Delete video |

### Enrollments, Progress, Reviews, Wishlist — see source code

---

## 🎨 Design System

Custom Tailwind classes defined in `index.css`:

| Class | Usage |
|-------|-------|
| `.btn-primary` | Main CTA button (black/white) |
| `.btn-secondary` | Bordered button |
| `.btn-danger` | Red destructive button |
| `.btn-ghost` | Subtle hover button |
| `.card` | White rounded-2xl bordered card |
| `.glass-card` | Glassmorphism backdrop-blur card |
| `.input` | Styled form input |
| `.label` | Form label |
| `.badge-green/red/gray/blue` | Status badges |
| `.sidebar-item` | Nav item with active state |
| `.skeleton` | Loading skeleton animation |

---

## 📦 Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve with Express (add static serving in server.js)
cd backend && npm start
```

---

## 🔒 Security Notes

- Change `JWT_SECRET` to a long random string in production
- Change `ADMIN_SECRET` to something strong
- Use Gmail App Password (not your real password)
- Set `NODE_ENV=production` in production
- Store uploads on S3/Cloudinary in production instead of local disk
- Add rate limiting with `express-rate-limit` for production

---

## 📄 License

MIT — Free to use and modify.
