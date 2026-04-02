# ProjectFlow 🚀

A full-stack Jira + Slack hybrid for team project management.

## Tech Stack
- **Frontend**: React 18, React Query, DnD Kit, Recharts, React Router v6
- **Backend**: Node.js, Express.js, MVC architecture
- **Database**: MySQL
- **Auth**: JWT with role-based access control (Admin, Manager, Employee)

---

## 📁 Project Structure

```
projectflow/
├── backend/
│   ├── config/          # DB connection & migration
│   ├── controllers/     # Business logic (auth, projects, tasks, chat, dashboard)
│   ├── middleware/      # JWT auth, RBAC, file upload, error handling
│   ├── routes/          # Express routers
│   ├── uploads/         # Uploaded files (gitignored)
│   └── server.js        # App entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/  # Reusable UI (Layout)
        ├── context/     # AuthContext
        ├── pages/       # All page components
        ├── styles/      # Global CSS variables & utilities
        └── utils/       # Axios API instance
```

---

## 🚀 Getting Started

### 1. Database Setup

```bash
# Create MySQL database & run migrations
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run migrate
```

### 2. Backend

```bash
cd backend
npm run dev
# API runs at http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
# App runs at http://localhost:3000
```

---

## 🔐 Default Roles

| Role     | Capabilities |
|----------|-------------|
| Admin    | Full access, manage all projects & users |
| Manager  | Create/edit projects, manage tasks |
| Employee | View assigned projects, update tasks |

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/auth/users` | List all users |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/projects` | List projects |
| POST   | `/api/projects` | Create project |
| GET    | `/api/projects/:id` | Get project detail |
| PUT    | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST   | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/projects/:projectId/tasks` | List tasks (with filters) |
| POST   | `/api/projects/:projectId/tasks` | Create task |
| PUT    | `/api/projects/:projectId/tasks/:id` | Update task |
| PATCH  | `/api/projects/:projectId/tasks/:id/status` | Update status |
| DELETE | `/api/projects/:projectId/tasks/:id` | Delete task |
| GET    | `/api/projects/:projectId/tasks/:taskId/comments` | Get comments |
| POST   | `/api/projects/:projectId/tasks/:taskId/comments` | Add comment |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/projects/:projectId/chat` | Get messages (paginated) |
| GET    | `/api/projects/:projectId/chat/poll?since=...` | Poll new messages |
| POST   | `/api/projects/:projectId/chat` | Send message (supports file upload) |
| DELETE | `/api/projects/:projectId/chat/:id` | Delete message |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/dashboard/stats` | Dashboard statistics |
| GET    | `/api/dashboard/notifications` | User notifications |
| PUT    | `/api/dashboard/notifications/:id/read` | Mark notification read |

---

## ✨ Features

- ✅ JWT authentication with role-based access control
- ✅ Project management (create, edit, delete, member management)
- ✅ Kanban board with drag-and-drop (DnD Kit)
- ✅ Task comments system
- ✅ Real-time-like chat (4s polling)
- ✅ File uploads (images, PDFs, Excel) in chat
- ✅ Reply-to-message support
- ✅ Dashboard analytics (Recharts charts)
- ✅ Notifications system
- ✅ Activity logging
- ✅ Search & filters for tasks
- ✅ Dark theme UI

## 🔄 Upgrading to WebSockets

The chat service is architected for easy Socket.io upgrade:
1. Install `socket.io` in backend
2. Replace polling in `ChatPage.js` with socket connection
3. Emit `new_message` events from `chatController.sendMessage`

