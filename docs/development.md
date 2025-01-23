# Development Guide

## Setup Development Environment

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- SQLite3
- Git

### Initial Setup

1. Clone the Repository
```bash
git clone https://github.com/jazmy/formchat.git
cd formchat
```

2. Install Dependencies
```bash
# Install all dependencies
npm install
```

3. Environment Configuration
```bash
# Copy environment example files
cp .env.example .env
```

4. Initialize Database
```bash
npm run db:init
```

## Development Workflow

### Running the Application

1. Start Development Server
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Code Structure

```
formchat/
├── src/
│   ├── client/           # Frontend React application
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   │
│   ├── server/           # Backend Node.js application
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── db/          # Database migrations and models
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   │
│   └── shared/           # Shared code between client and server
│       ├── types/        # TypeScript types
│       ├── constants/    # Shared constants
│       └── utils/        # Shared utilities
│
├── dist/                 # Compiled code
├── docs/                 # Documentation
└── tests/                # Test files
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern=src/server/services

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Test Structure

```
tests/
├── client/              # Frontend tests
│   ├── components/      # Component tests
│   ├── hooks/          # Hook tests
│   └── utils/          # Utility tests
│
├── server/              # Backend tests
│   ├── controllers/    # Controller tests
│   ├── services/      # Service tests
│   └── utils/         # Utility tests
│
└── integration/         # Integration tests
```

## Code Style and Linting

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off'
  }
};
```

### Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  endOfLine: 'lf'
};
```

### Running Linting

```bash
# Lint all files
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Git Workflow

### Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Refactoring: `refactor/description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding tests
- chore: Build process or auxiliary tool changes

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit following conventions
3. Push branch and create PR to `develop`
4. Ensure CI passes
5. Get code review approval
6. Squash and merge

## Continuous Integration

GitHub Actions workflow:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          npm run deploy
```

## Debugging

### Backend Debugging

1. Using VS Code:
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

2. Using Chrome DevTools:
```bash
npm run dev:debug
```
Then open Chrome DevTools at chrome://inspect

### Frontend Debugging

1. React Developer Tools
2. Redux DevTools (if using Redux)
3. Browser DevTools Console/Network

### Debug Logging

```typescript
import debug from 'debug';

const log = debug('formchat:component-name');

log('Debug message');
```

Enable debug output:
```bash
DEBUG=formchat:* npm run dev
```

## Performance Monitoring

### Backend Metrics

```typescript
import { metrics } from '../utils/metrics';

// Record timing
metrics.timing('api.response.time', responseTime);

// Increment counter
metrics.increment('api.requests.total');

// Record value
metrics.gauge('memory.usage', process.memoryUsage().heapUsed);
```

### Frontend Monitoring

```typescript
import { monitor } from '../utils/monitoring';

// Record page load
monitor.pageView('/form/123');

// Record user interaction
monitor.event('form', 'submit');

// Record error
monitor.error(new Error('Form submission failed'));
```

## Documentation

### Code Documentation

Use JSDoc for documentation:

```typescript
/**
 * Validates form response using AI
 * @param {FormResponse} response - The form response to validate
 * @param {ValidationOptions} options - Validation options
 * @returns {Promise<ValidationResult>} Validation result
 * @throws {ValidationError} If validation fails
 */
async function validateResponse(
  response: FormResponse,
  options: ValidationOptions
): Promise<ValidationResult> {
  // Implementation
}
```

### API Documentation

Use OpenAPI/Swagger for API documentation:

```yaml
# swagger.yaml
openapi: 3.0.0
info:
  title: FormChat API
  version: 1.0.0
paths:
  /api/forms:
    get:
      summary: List forms
      responses:
        '200':
          description: List of forms
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Form'
```

Generate API documentation:
```bash
npm run docs:api
```

## Contributing

See [Contributing Guide](../CONTRIBUTING.md) for guidelines.

## Resources

- [API Documentation](api.md)
- [Component Documentation](components.md)
- [Security Guide](security.md)
- [Database Schema](database.md)
