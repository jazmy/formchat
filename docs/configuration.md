# Configuration Guide

## Environment Variables

### Backend Configuration

```env
# Server Configuration
PORT=3001                    # Server port number
NODE_ENV=development         # Environment (development/production)
DB_PATH=./data/formchat.sqlite3  # SQLite database path

# Security
JWT_SECRET=your-secret-key   # JWT signing secret
JWT_EXPIRY=24h              # Token expiry time

# OpenAI Configuration
OPENAI_API_KEY=your-key     # OpenAI API key

# Logging
LOG_LEVEL=info              # Logging level (error/warn/info/debug)
LOG_FORMAT=json             # Log format (json/text)
```

### Frontend Configuration

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001  # Backend API URL
REACT_APP_WS_URL=ws://localhost:3001     # WebSocket URL

# Feature Flags
REACT_APP_ENABLE_LOGGING=true            # Enable client-side logging
```

## Environment Setup

FormChat uses environment variables for configuration. Template files are provided for both backend and frontend:

1. **Backend Configuration**:
   ```bash
   # Copy the template
   cp backend/.env.template backend/.env
   
   # Edit with your values
   nano backend/.env
   ```

2. **Frontend Configuration**:
   ```bash
   # Copy the template
   cp frontend/.env.template frontend/.env
   
   # Edit with your values
   nano frontend/.env
   ```

The template files contain detailed comments explaining each variable. Make sure to:
- Never commit `.env` files to version control
- Use different values for development and production
- Keep sensitive values secure

## Database Configuration

SQLite configuration in `backend/knexfile.js`:

```javascript
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || './data/formchat.sqlite3'
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  // Add production configuration as needed
};
```

## Settings System

FormChat uses a dynamic settings system stored in the database. Settings are stored as key-value pairs and can be nested.

### Database Schema

```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Default Settings Structure

```javascript
{
  OPENAI_API_KEY: string,  // From environment or database
  MODELS: {
    CHAT: 'gpt-4',
    VALIDATION: 'gpt-4',
    WELCOME: 'gpt-4',
    GUIDANCE: 'gpt-4',
    OUTPUT: 'gpt-4'
  },
  CHAT_PROCESSING: {
    MAX_TOKENS: {
      CHAT: 1000,
      VALIDATION: 500,
      WELCOME: 200,
      GUIDANCE: 800,
      OUTPUT: 1500
    },
    TEMPERATURE: {
      CHAT: 0.7,
      VALIDATION: 0.3,
      WELCOME: 0.7,
      GUIDANCE: 0.5,
      OUTPUT: 0.7
    }
  },
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MIN: 20
  }
}
```

### Settings Management

```javascript
// Get all settings
const settings = await getSettings();

// Update a single setting
await updateSetting('MODELS.CHAT', 'gpt-4');

// Update multiple settings
await updateSettings({
  MODELS: {
    CHAT: 'gpt-4',
    VALIDATION: 'gpt-3.5-turbo'
  }
});

// Delete a setting
await deleteSetting('MODELS.CHAT');
```

## Security Configuration

### CORS Settings

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
```

### Rate Limiting

```javascript
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
};
```

## OpenAI Integration

The OpenAI service is configured through the settings system and includes rate limiting:

```javascript
class OpenAIService {
  constructor() {
    this.openai = null;
    this.settings = null;
    this.limiter = new Bottleneck({
      minTime: (60 * 1000) / 20, // default rate limit
      maxConcurrent: 1
    });
  }

  async initialize() {
    this.settings = await getSettings();
    this.openai = new OpenAI({
      apiKey: this.settings.OPENAI_API_KEY || process.env.OPENAI_API_KEY
    });

    // Update rate limiter if settings exist
    if (this.settings.RATE_LIMIT?.MAX_REQUESTS_PER_MIN) {
      this.limiter = new Bottleneck({
        minTime: (60 * 1000) / this.settings.RATE_LIMIT.MAX_REQUESTS_PER_MIN,
        maxConcurrent: 1
      });
    }
  }
}
```

## Logging Configuration

FormChat implements a comprehensive logging system that captures both backend and frontend events.

### Log Files

1. **Backend Logs** (in `/backend/logs/`):
   - `combined.log`: All logs of level 'info' and above
   - `error.log`: Only error-level logs
   
   Backend logs use Winston logger with the following configuration:
   - Maximum file size: 5MB per file
   - Maximum files: 5 (rotating)
   - Format: JSON with timestamps
   ```javascript
   {
     "timestamp": "2025-01-22T20:28:02-08:00",
     "level": "info",
     "message": "Server started on port 3001"
   }
   ```

2. **Frontend Logs** (in `/backend/logs/frontend/`):
   - `error.log`: Frontend error events
   - `info.log`: Frontend info events
   - Maximum entries: 250 lines per file
   - Format: JSON with timestamps and metadata
   ```javascript
   {
     "timestamp": "2025-01-22T20:28:02-08:00",
     "level": "error",
     "message": "Failed to load form",
     "data": { "formId": "123" },
     "userAgent": "Mozilla/5.0...",
     "ip": "127.0.0.1"
   }
   ```

### What Gets Logged

1. **Backend Events**:
   - Server startup/shutdown
   - API requests and responses
   - Database operations
   - Authentication events
   - OpenAI API interactions
   - Error conditions and stack traces

2. **Frontend Events**:
   - Form interactions
   - Chat completions
   - API request failures
   - UI errors
   - User interactions with critical features

### Log Levels

- **ERROR**: System errors, API failures, database errors
- **WARN**: Validation failures, deprecated feature usage
- **INFO**: Normal operations, API requests, user actions
- **DEBUG**: Detailed debugging information (development only)

### Log Retention

1. **Backend Logs**:
   - Each log file is limited to 5MB
   - Maximum of 5 rotating files per log type
   - Total maximum storage: ~50MB

2. **Frontend Logs**:
   - Each log file keeps the most recent 250 entries
   - Older entries are automatically removed
   - Separate files for each log level

### Accessing Logs

1. **Via API** (Admin only):
   ```bash
   # Get all logs
   GET /api/logs
   
   # Get specific level
   GET /api/logs/error
   GET /api/logs/info
   ```

2. **Direct File Access**:
   ```bash
   # View backend logs
   tail -f backend/logs/combined.log
   tail -f backend/logs/error.log
   
   # View frontend logs
   tail -f backend/logs/frontend/error.log
   tail -f backend/logs/frontend/info.log
   ```

### Environment Variables

```env
# Logging Configuration
LOG_LEVEL=info              # Minimum level to log (error/warn/info/debug)
LOG_FORMAT=json             # Log format (json/text)
```

### Best Practices

1. **Production**:
   - Set `LOG_LEVEL=info` for normal operation
   - Use `json` format for better parsing
   - Regularly archive and clean old log files

2. **Development**:
   - Set `LOG_LEVEL=debug` for detailed logging
   - Use `text` format for better readability
   - Monitor `error.log` for debugging

3. **Security**:
   - Logs are automatically sanitized of sensitive data
   - API keys and passwords are never logged
   - User data is partially redacted in logs

Winston logger configuration:

```javascript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT === 'json' 
    ? winston.format.json()
    : winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});
```

## Production Considerations

1. **Environment Variables**
   - Use a secure secrets management system
   - Rotate JWT secrets regularly
   - Use strong API keys
   - Set appropriate rate limits

2. **Security Headers**
   ```javascript
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         imgSrc: ["'self'", "data:", "https:"],
         connectSrc: ["'self'", "wss:", "https:"]
       }
     },
     crossOriginEmbedderPolicy: true,
     crossOriginOpenerPolicy: true,
     crossOriginResourcePolicy: { policy: "same-site" },
     dnsPrefetchControl: true,
     frameguard: { action: "deny" },
     hsts: true,
     ieNoOpen: true,
     noSniff: true,
     referrerPolicy: { policy: "strict-origin-when-cross-origin" },
     xssFilter: true
   }));
   ```

3. **Database Optimization**
   - Enable WAL mode for SQLite
   - Regular vacuum and optimization
   - Implement connection pooling
   - Set appropriate timeouts

4. **Caching Strategy**
   - Cache settings in memory
   - Implement rate limit caching
   - Use ETags for API responses
   - Consider Redis for scaling
