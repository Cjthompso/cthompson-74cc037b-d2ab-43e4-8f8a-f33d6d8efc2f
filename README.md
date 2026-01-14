# Task Management System

A full-stack task management app with different user roles. Built with NestJS (backend), Angular (frontend), and SQLite database.

## What It Does

- Users can create, view, edit, and delete tasks
- Three user roles with different permissions:
  - **Owner**: Can do everything including manage users
  - **Admin**: Can manage tasks and view audit logs
  - **Viewer**: Can only view tasks (read-only)
- Tracks all actions in an audit log
- JWT authentication for secure login

## Tech Stack

- **Frontend**: Angular 17 with Tailwind CSS
- **Backend**: NestJS with TypeORM
- **Database**: SQLite
- **Monorepo**: NX

## Project Structure

```
apps/
  api/          # Backend API
  dashboard/    # Frontend app
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Seed the database with test users:
```bash
npm run seed
```

3. Start the backend:
```bash
npm run start:api
```

4. Start the frontend (in a new terminal):
```bash
npm run start:dashboard
```

5. Open http://localhost:4200

## Test Accounts

All passwords are `password123`

| Email | Role | What They Can Do |
|-------|------|------------------|
| owner@test.com | Owner | Everything |
| admin@test.com | Admin | Tasks + Audit Log |
| viewer@test.com | Viewer | View tasks only |

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Other
- `GET /api/audit-log` - View audit log (Owner/Admin only)
- `GET /api/users` - List users (Owner only)
- `PUT /api/users/:id/role` - Change user role (Owner only)

## Role Permissions

| Action | Owner | Admin | Viewer |
|--------|-------|-------|--------|
| Create Task | Yes | Yes | No |
| View Tasks | Yes | Yes | Yes |
| Edit Task | Yes | Yes | No |
| Delete Task | Yes | Yes | No |
| View Audit Log | Yes | Yes | No |
| Manage Users | Yes | No | No |

## Database Tables

- **users** - User accounts and roles
- **tasks** - Task data
- **organizations** - Organization info
- **audit_logs** - Action history

## Scripts

```bash
npm run start:api        # Start backend
npm run start:dashboard  # Start frontend
```

## Notes

- First user to register becomes Owner automatically
- owner@test.com, admin@test.com, and viewer@test.com get their roles based on email
- password123 for all accounts
- All actions are logged to the audit_logs table
- JWT tokens expire after 24 hours