# FormChat Technical Architecture

## System Overview
FormChat is built using a modern web stack with a clear separation of concerns between frontend and backend components. The architecture is designed to be scalable, maintainable, and secure.

## Frontend Architecture

### Technology Stack
- **React**: Core UI framework
- **Material-UI**: Component library
- **React Router**: Navigation management
- **Axios**: HTTP client

### Component Structure
```
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.js
│   │   ├── AdminLayout.js
│   │   ├── AdminLogin.js
│   │   ├── AdminSettings.js
│   │   ├── FormBuilder.js
│   │   ├── FormList.js
│   │   └── FormResponses.js
│   ├── chat/
│   │   ├── ChatBubble.js
│   │   ├── ChatForm.js
│   │   ├── ChatInput.js
│   │   ├── ResponseActions.js
│   │   └── TypingIndicator.js
│   └── common/
│       ├── DragDropWrapper.js
│       └── PrivateRoute.js
├── services/
│   ├── api.js
│   └── auth.js
└── utils/
    ├── validation.js
    └── formatting.js
```

### Key Features

#### Chat Interface
- Real-time conversation flow
- Dynamic form progression
- Answer validation
- Response suggestions
- Progress tracking

#### Admin Dashboard
- Form management
- Response analytics
- Settings configuration
- User authentication

#### Form Builder
- Drag-and-drop interface
- Validation rules
- Output prompt configuration
- Preview functionality

## Backend Architecture

### Technology Stack
- **Node.js**: Server runtime
- **Express**: Web framework
- **SQLite3**: Database
- **Knex.js**: Query builder
- **OpenAI API**: AI integration
- **JWT**: Authentication
- **Winston**: Logging

### Directory Structure
```
backend/
├── routes/
│   ├── auth.js
│   ├── forms.js
│   ├── responses.js
│   └── settings.js
├── middleware/
│   └── auth.js
├── services/
│   └── formService.js
├── utils/
│   └── logger.js
└── server.js
```

### Database Schema

#### Forms Table
```sql
CREATE TABLE forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    prompts TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Responses Table
```sql
CREATE TABLE responses (
    responseid TEXT PRIMARY KEY,
    formid INTEGER,
    responses TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formid) REFERENCES forms(id)
);
```

#### Admins Table
```sql
CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);
```

### API Structure

#### Authentication
- JWT-based authentication
- Token expiration
- Protected routes middleware

#### Form Management
- CRUD operations
- Validation rules
- Response tracking

#### Response Handling
- Answer submission
- CSV export
- Analytics

## Security Features

### Authentication
- Bcrypt password hashing
- JWT token validation
- Protected admin routes

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection

### API Security
- CORS configuration
- Rate limiting
- Error handling

## Performance Optimizations

### Frontend
- Component memoization
- Lazy loading
- Debounced inputs

### Backend
- Connection pooling
- Query optimization
- Response caching

## Development Tools

### Required Tools
- Node.js v14+
- npm v6+
- SQLite3

### Environment Variables
```
PORT=3001
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-api-key
```

## Deployment

### Development
```bash
# Frontend
npm install
npm start

# Backend
npm install
npm run migrate
npm run dev
```

### Production
- Secure environment variables
- Database backups
- Error monitoring
- Performance tracking
