# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### 1. Node Version Mismatch
**Problem**: `Error: The engine "node" is incompatible with this module`

**Solution**:
1. Check your Node.js version:
```bash
node --version
```
2. Install correct version (v18 or higher):
```bash
nvm install 18
nvm use 18
```

#### 2. Dependencies Installation Failed
**Problem**: `npm ERR! Failed at the formchat@1.0.0 install script`

**Solution**:
1. Clear npm cache:
```bash
npm cache clean --force
```
2. Delete node_modules:
```bash
rm -rf node_modules
rm package-lock.json
```
3. Reinstall dependencies:
```bash
npm install
```

### Database Issues

#### 1. Database Connection Failed
**Problem**: `Error: SQLITE_CANTOPEN: unable to open database file`

**Solution**:
1. Check database path in `.env`:
```env
DB_PATH=./data/formchat.sqlite3
```
2. Ensure directory exists:
```bash
mkdir -p data
```
3. Initialize database:
```bash
npm run db:init
```

#### 2. Database Migration Failed
**Problem**: `Error: migration failed`

**Solution**:
1. Check migration logs:
```bash
npm run db:migrate -- --verbose
```
2. Reset database (if needed):
```bash
npm run db:reset
```
3. Run migrations again:
```bash
npm run db:migrate
```

#### 3. Database Locked
**Problem**: `Error: SQLITE_BUSY: database is locked`

**Solution**:
1. Check for other connections:
```bash
lsof | grep formchat.sqlite3
```
2. Enable WAL mode:
```sql
PRAGMA journal_mode=WAL;
```
3. Adjust busy timeout:
```sql
PRAGMA busy_timeout=5000;
```

### OpenAI API Issues

#### 1. API Key Invalid
**Problem**: `Error: Invalid API key provided`

**Solution**:
1. Check API key in `.env`:
```env
OPENAI_API_KEY=your-key-here
```
2. Verify key is valid:
```bash
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```
3. Generate new key if needed

#### 2. Rate Limit Exceeded
**Problem**: `Error: Rate limit exceeded`

**Solution**:
1. Check current settings:
```javascript
console.log(await getSettings());
```
2. Adjust rate limits:
```javascript
await updateSettings({
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MIN: 20
  }
});
```
3. Implement exponential backoff

#### 3. Context Length Exceeded
**Problem**: `Error: Maximum context length exceeded`

**Solution**:
1. Check token usage:
```javascript
const usage = response.usage;
console.log(usage.total_tokens);
```
2. Adjust max tokens:
```javascript
await updateSettings({
  CHAT_PROCESSING: {
    MAX_TOKENS: {
      CHAT: 1000,
      VALIDATION: 500
    }
  }
});
```

### Form Issues

#### 1. Form Creation Failed
**Problem**: `Error: Failed to create form`

**Solution**:
1. Check form data structure:
```javascript
const form = {
  title: 'Test Form',
  description: 'Test Description',
  welcome_message: 'Welcome',
  completion_message: 'Thank you',
  settings: {
    validation: {
      enabled: true
    }
  }
};
```
2. Verify required fields
3. Check database permissions

#### 2. Form Response Validation Failed
**Problem**: `Error: Response validation failed`

**Solution**:
1. Check validation rules:
```javascript
const prompt = {
  text: 'Your question',
  variable: 'response_var',
  validation: {
    required: true,
    rules: ['length > 10']
  }
};
```
2. Review AI validation settings
3. Check response format

### Performance Issues

#### 1. Slow Response Times
**Problem**: API endpoints taking too long to respond

**Solution**:
1. Enable performance monitoring:
```javascript
metrics.timing('api.response.time', responseTime);
```
2. Check database indexes:
```sql
CREATE INDEX IF NOT EXISTS idx_responses_form_id 
ON responses(form_id);
```
3. Implement caching:
```javascript
const cache = new NodeCache({ stdTTL: 3600 });
```

#### 2. High Memory Usage
**Problem**: Process using excessive memory

**Solution**:
1. Monitor memory usage:
```javascript
metrics.gauge('memory.usage', process.memoryUsage().heapUsed);
```
2. Implement garbage collection:
```javascript
if (global.gc) {
  global.gc();
}
```
3. Check for memory leaks:
```bash
npm run debug:memory
```

### Security Issues

#### 1. CORS Errors
**Problem**: `Access-Control-Allow-Origin` errors

**Solution**:
1. Check CORS configuration:
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};
```
2. Update environment variables:
```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

#### 2. Rate Limiting Errors
**Problem**: Too many requests from single source

**Solution**:
1. Configure rate limiting:
```javascript
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
};
```
2. Implement per-route limits:
```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', apiLimiter);
```

## Debugging

### Backend Debugging

#### 1. Enable Debug Logging
```javascript
const debug = require('debug')('formchat:server');
debug('Server starting...');
```

#### 2. Use VS Code Debugger
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/src/server/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true
    }
  ]
}
```

#### 3. Monitor API Calls
```javascript
app.use((req, res, next) => {
  debug(`${req.method} ${req.path}`);
  next();
});
```

### Database Debugging

#### 1. Enable Query Logging
```javascript
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: process.env.DB_PATH
  },
  debug: true,
  log: {
    debug(message) {
      debug(message);
    }
  }
});
```

#### 2. Check Database State
```bash
sqlite3 ./data/formchat.sqlite3
.tables
.schema responses
SELECT COUNT(*) FROM responses;
```

#### 3. Validate Data Integrity
```sql
PRAGMA foreign_key_check;
PRAGMA integrity_check;
```

### AI Debugging

#### 1. Log AI Requests
```javascript
debug('AI Request:', {
  model: settings.MODELS.CHAT,
  messages,
  temperature: settings.CHAT_PROCESSING.TEMPERATURE.CHAT
});
```

#### 2. Monitor Token Usage
```javascript
metrics.histogram('ai.tokens.total', response.usage.total_tokens);
metrics.histogram('ai.tokens.completion', response.usage.completion_tokens);
```

#### 3. Validate AI Responses
```javascript
debug('AI Response:', {
  role: response.choices[0].message.role,
  content: response.choices[0].message.content,
  finish_reason: response.choices[0].finish_reason
});
```

## Maintenance

### Database Maintenance

#### 1. Regular Cleanup
```sql
VACUUM;
ANALYZE;
```

#### 2. Optimize Indexes
```sql
REINDEX;
```

#### 3. Check for Corruption
```sql
PRAGMA quick_check;
```

### Performance Monitoring

#### 1. API Metrics
```javascript
metrics.timing('api.response.time', responseTime);
metrics.increment('api.requests.total');
metrics.gauge('memory.usage', process.memoryUsage().heapUsed);
```

#### 2. Database Metrics
```javascript
metrics.histogram('db.query.time', queryTime);
metrics.increment('db.queries.total');
metrics.gauge('db.size', getDatabaseSize());
```

#### 3. AI Metrics
```javascript
metrics.timing('ai.response.time', aiResponseTime);
metrics.increment('ai.requests.total');
metrics.histogram('ai.tokens.total', tokenCount);
```

## Best Practices

### Error Handling

#### 1. Structured Error Response
```javascript
function errorHandler(err, req, res, next) {
  debug('Error:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      code: err.code,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
}
```

#### 2. Custom Error Classes
```javascript
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.details = details;
  }
}
```

### Logging

#### 1. Use Structured Logging
```javascript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
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

#### 2. Log Important Events
```javascript
logger.info('Form created', {
  formId: form.id,
  userId: user.id,
  timestamp: new Date()
});
```

### Security

#### 1. Input Validation
```javascript
const schema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  settings: Joi.object()
});

const { error } = schema.validate(req.body);
if (error) throw new ValidationError(error.message);
```

#### 2. Security Headers
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
  }
}));
