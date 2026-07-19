# LifeOS Lite

LifeOS Lite is a full stack student productivity dashboard built for a university semester examination. This Phase 1 setup creates the complete project foundation without implementing any business features yet.

## Phase 1 Scope

- Complete frontend and backend folder structure
- Express server configuration
- MongoDB Atlas connection setup
- React + Vite setup
- Tailwind CSS configuration
- React Router configuration
- Environment template, `.gitignore`, and project documentation

## Tech Stack

### Frontend

- React.js with Vite
- Tailwind CSS
- React Router DOM
- Axios
- Chart.js

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt

## Folder Structure

```text
LifeOS-Lite/
├── .env.example
├── .gitignore
├── README.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── index.css
│       ├── layouts/
│       │   └── AppLayout.jsx
│       ├── main.jsx
│       ├── pages/
│       │   └── SetupPage.jsx
│       └── services/
└── server/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── healthController.js
    ├── middleware/
    │   └── errorMiddleware.js
    ├── models/
    ├── package.json
    ├── routes/
    │   ├── healthRoutes.js
    │   └── index.js
    ├── server.js
    └── utils/
```

## Installation Commands

Run each command exactly as shown from the project root:

```bash
mkdir -p client/src/assets client/src/components client/src/context client/src/hooks client/src/layouts client/src/pages client/src/services server/config server/controllers server/middleware server/models server/routes server/utils
cd server
npm install express mongoose cors dotenv morgan jsonwebtoken bcrypt
npm install -D nodemon
cd ../client
npm install react react-dom react-router-dom axios chart.js
npm install -D vite @vitejs/plugin-react tailwindcss@3 postcss autoprefixer
cd ..
```

## Environment Setup

Create a backend environment file before running the server:

```bash
cp .env.example server/.env
```

Then update `server/.env` with your real MongoDB Atlas connection string and a strong JWT secret.

## How To Run The Project

Use two terminals.

### Terminal 1

```bash
cd server
npm run dev
```

### Terminal 2

```bash
cd client
npm run dev
```

After both servers start:

- Frontend: `http://localhost:5173`
- Backend root: `http://localhost:5000`
- Backend health route: `http://localhost:5000/api/health`

## Common Setup Errors And Fixes

### 1. `MONGO_URI is not set`

Cause: `server/.env` was not created or not updated.

Fix:

```bash
cp .env.example server/.env
```

Then replace the example `MONGO_URI` value with your real MongoDB Atlas URI.

### 2. `EADDRINUSE: address already in use`

Cause: Port `5000` or `5173` is already being used by another process.

Fix:

- Stop the running process using that port.
- Or change `PORT` inside `server/.env`.
- Or change the Vite port inside `client/vite.config.js`.

### 3. Tailwind styles are not visible

Cause: Dependencies were not installed correctly or the dev server was not restarted after setup.

Fix:

```bash
cd client
npm install
npm run dev
```

### 4. CORS error in the browser

Cause: The frontend URL does not match `CLIENT_URL` in `server/.env`.

Fix:

- Set `CLIENT_URL=http://localhost:5173` in `server/.env`.
- Restart the backend server.

### 5. `Cannot find package` or `Cannot find module`

Cause: `node_modules` is missing or dependencies were interrupted during installation.

Fix:

```bash
cd server
npm install
cd ../client
npm install
```

## Current Status

Phase 1 is limited to setup only.

Not included yet:

- Authentication
- Dashboard data
- Task management
- Study planner logic
- Attendance tracking
- AI assistant
- Analytics
