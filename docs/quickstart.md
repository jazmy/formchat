# Quick Start Guide

Get up and running with FormChat in minutes!

## Prerequisites

- Node.js v14 or higher
- npm v6 or higher
- SQLite3
- OpenAI API key

## Quick Installation

```bash
# Clone repository
git clone https://github.com/jazmy/formchat.git
cd formchat

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cd ../backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

cd ../frontend
cp .env.example .env

# Initialize database
cd ../backend
npm run migrate  # Create database tables
npm run seed    # Create default admin user and sample data

# Start development servers
npm run dev     # Start backend server
cd ../frontend
npm start       # Start frontend server
```

## Default Admin Login

After running the database seed, you can log in with these credentials:
```
URL: http://localhost:3000/admin
Username: admin
Password: admin123
```

**IMPORTANT**: Change these credentials immediately after first login!

## First Steps

1. **Change Admin Password**
   - Log in to admin dashboard
   - Go to Settings
   - Click "Change Password"
   - Set a secure password

2. **Create Your First Form**
   - Click "Create New Form"
   - Add form title (required)
   - Add description
   - Add prompts/questions:
     - Question text
     - Variable name
     - Validation criteria
   - Save form

3. **Test Your Form**
   - Click "Preview" on your form
   - Try submitting responses
   - Test validation
   - Check AI feedback

4. **Monitor Responses**
   - View responses in dashboard
   - Export as CSV
   - Filter and search
   - Delete if needed

## Key Features

### Chat Interface
- Natural conversation flow
- Real-time response validation
- Context-aware help system
- Progress tracking
- Answer revision

### Form Management
- Drag-and-drop prompt ordering
- Custom validation rules
- Response monitoring
- CSV export
- Form previews

### AI Integration
- OpenAI GPT-3.5/4 integration
- Smart answer validation
- Contextual suggestions
- Natural language processing

## Troubleshooting

### Common Setup Issues

1. **Database Issues**
```bash
# Reset database
cd backend
rm -rf data/*.sqlite3
npm run migrate
npm run seed
```

2. **Port Conflicts**
```bash
# Backend port in use
lsof -i :3001  # Check what's using port
kill -9 <PID>  # Free up port if needed

# Frontend port in use
lsof -i :3000
kill -9 <PID>
```

3. **Dependencies**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

## Next Steps

1. **Configuration**
   - [Environment Variables](installation.md#environment-variables)
   - [Database Configuration](database.md)
   - [OpenAI Settings](ai-configuration.md)

2. **Documentation**
   - [API Documentation](api.md)
   - [Component Guide](components.md)
   - [Security Best Practices](security.md)

3. **Development**
   - [Architecture Overview](architecture.md)
   - [Contributing Guide](../CONTRIBUTING.md)
   - [Testing Guide](testing.md)

4. **Support**
   - GitHub Issues
   - Documentation
   - Community Discussions
