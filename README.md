# LifeOS Lite

LifeOS Lite is a full-stack student productivity dashboard built with React, Express, MongoDB, and Mongoose. It provides authenticated task management, attendance tracking, study planning, analytics, and a transparent rule-based study assistant.

## Features

- JWT authentication with bcrypt password hashing and protected routes
- Dashboard with live task, attendance, study, productivity, and AI insight data
- User-scoped CRUD modules for tasks, attendance records, and study sessions
- Analytics for weekly and monthly task progress, attendance trends, and productivity
- Rule-based AI Study Assistant built from the authenticated user's own data
- Responsive light and dark interface with keyboard-accessible dialogs and Chart.js charts

## Project Structure

```text
LifeOS-Lite/
  client/                 React + Vite + Tailwind application
  server/                 Express API using MVC architecture
    config/               Environment and database configuration
    controllers/          HTTP request handlers
    middleware/           Authentication, validation, errors, security
    models/               Mongoose schemas
    routes/               API route definitions
    services/             Rule-based AI business logic
    utils/                Shared calculations and helpers
    tests/                Node built-in unit tests
```

## Setup

1. Install dependencies.

```bash
cd client
npm install

cd ../server
npm install
```

2. Create the environment files from the examples.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Set a MongoDB Atlas connection string and a unique JWT secret of at least 32 characters in `server/.env`.

4. Start both applications in separate terminals.

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:5000` by default.

## Quality Checks

```bash
cd client
npm run lint
npm run build
```

```bash
cd server
npm test
npm audit --omit=dev --audit-level=high
```

## API Endpoints

| Module | Method | Endpoint |
| --- | --- | --- |
| Health | GET | `/api/health` |
| Auth | POST | `/api/auth/register` |
| Auth | POST | `/api/auth/login` |
| Auth | GET | `/api/auth/profile` |
| Dashboard | GET | `/api/dashboard` |
| Tasks | GET, POST | `/api/tasks` |
| Tasks | GET, PUT, DELETE | `/api/tasks/:id` |
| Attendance | GET, POST | `/api/attendance` |
| Attendance | GET, PUT, DELETE | `/api/attendance/:id` |
| Study Sessions | GET, POST | `/api/study-sessions` |
| Study Sessions | GET, PUT, DELETE | `/api/study-sessions/:id` |
| Analytics | GET | `/api/analytics` |
| AI | GET | `/api/ai/dashboard-summary` |
| AI | POST | `/api/ai/study-plan` |
| AI | POST | `/api/ai/revision-plan` |
| AI | POST | `/api/ai/productivity-tips` |

All non-auth data endpoints require `Authorization: Bearer <token>` and only return data for the authenticated user.

## Security Notes

- Never commit `.env` files. They are ignored by Git; only `.env.example` files are versioned.
- Rotate any database or JWT secret that has been shared, exposed, or committed previously.
- The application uses security headers, request-size limits, CORS allowlisting, API throttling, input validation, and user-scoped MongoDB queries.
- The AI assistant is deterministic and does not send academic data to an external AI provider.
