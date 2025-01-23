# Installation Guide

## Prerequisites

Before installing FormChat, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- SQLite3
- Git

## Project Structure

```
formchat/
├── backend/             # Backend server code
├── frontend/           # Frontend React application
├── docs/              # Documentation
├── CONTRIBUTING.md    # Contribution guidelines
├── README.md         # Project overview
└── security.md      # Security documentation
```

## Installation Steps

1. Clone the Repository
```bash
git clone https://github.com/jazmy/formchat.git
cd formchat
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

4. Configure Environment Variables

Backend (`.env`):
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3001
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
```

Frontend (`.env`):
```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:3001
```

5. Initialize Database
```bash
cd ../backend
npm run migrate
```

6. Seed Database with Initial Data
```bash
npm run seed
```

This will create:
- Default admin user (credentials below)
- Sample forms and prompts
- Required lookup tables

### Default Admin Credentials
After seeding the database, you can log in with:
- Username: `admin`
- Password: `admin123`

**IMPORTANT**: Change these credentials immediately after first login!

## Running the Application

1. Start Backend Server (Development)
```bash
cd backend
npm run dev
```

2. Start Frontend Server (Development)
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## Production Deployment

For production deployment:

1. Build Frontend
```bash
cd frontend
npm run build
```

2. Configure Production Environment
```env
NODE_ENV=production
JWT_SECRET=your-secure-secret-key
OPENAI_API_KEY=your-openai-api-key
```

3. Start Production Server
```bash
cd backend
npm start
```

For production hosting, we recommend:
- Using NGINX as a reverse proxy
- Setting up SSL/TLS
- Implementing proper logging
- Regular database backups

## Database Troubleshooting

1. Check Database Connection
```bash
sqlite3 data/formchat.sqlite3
.tables  # Should list all tables
.schema admins  # View admins table schema
SELECT * FROM admins;  # Check admin users
.quit
```

2. Common Database Issues:
- "Database is locked": Close other connections or restart server
- "No such table": Run migrations again
- "SQLITE_CANTOPEN": Check file permissions and path
- "UNIQUE constraint failed": Duplicate entry attempt

3. Reset Database
```bash
# Remove existing database
rm -rf data/*.sqlite3

# Recreate database
npm run migrate
npm run seed
```

4. Debug SQL Queries
```bash
# Enable query logging
export DEBUG=knex:query
npm run dev

# View specific table data
sqlite3 data/formchat.sqlite3
.headers on
.mode column
SELECT * FROM forms;
SELECT * FROM prompts;
.quit
```

## Troubleshooting

If you encounter issues:

1. Verify Node.js Version
```bash
node --version  # Should be v14 or higher
npm --version   # Should be v6 or higher
```

2. Database Issues
```bash
cd backend
rm -rf data/*.sqlite3  # Remove existing database
npm run migrate        # Re-run migrations
npm run seed          # Re-seed data
```

3. Clean Installation
```bash
# Backend
cd backend
rm -rf node_modules
npm cache clean --force
npm install

# Frontend
cd ../frontend
rm -rf node_modules
npm cache clean --force
npm install
```

4. Common Issues:
- Port 3000/3001 already in use: Change ports in environment variables
- Database write permission: Check folder permissions
- CORS errors: Verify API URL in frontend .env
- JWT errors: Ensure JWT_SECRET is set correctly

For more detailed troubleshooting, check the logs:
- Backend: `backend/logs/`
- Frontend: Browser console

## Getting Help

If you need additional help:
1. Check the [Documentation](docs/)
2. Review [Common Issues](docs/troubleshooting.md)
3. Submit an issue on GitHub
4. Contact the development team
