# Environment Variables

This document describes the environment variables required for both the backend and frontend services.

## Backend Configuration

Create a `.env` file in the backend root directory:
```bash
cp .env.template .env
```

Configure the following variables in your `.env`:
```env
# Server Configuration
PORT=3001                           # Server port number
NODE_ENV=development                # Environment (development/production)

# Security
JWT_SECRET=your-secret-key-here     # JWT signing secret (change in production!)

# OpenAI Configuration
OPENAI_API_KEY=your-api-key-here    # OpenAI API key from admin settings or here
```

## Frontend Configuration

Create a `.env` file in the frontend root directory:
```bash
cp .env.template .env
```

Configure the following variables in your `.env`:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001  # Backend API URL

# Environment
NODE_ENV=development                     # Environment (development/production)