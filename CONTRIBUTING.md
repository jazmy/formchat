# Contributing to FormChat

Thank you for your interest in contributing to FormChat! We welcome contributions from the community.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](https://github.com/your-username/formchat/issues)
2. If not, create a new issue with a clear title and description
3. Include steps to reproduce, expected behavior, and actual behavior
4. Add relevant code snippets or screenshots

### Suggesting Enhancements
1. Create an issue describing your proposed enhancement
2. Include the rationale and potential implementation details
3. Discuss the enhancement with the community

### Pull Requests
1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure they pass
5. Update documentation as needed
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/formchat.git
cd formchat
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cp .env.development.example .env.development
# Edit .env.development with your configuration
```

4. Start development servers
```bash
# Start backend server
cd backend
npm start

# Start frontend server
cd frontend
npm start
```

## Code Style

- Follow existing code style
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Document new code using JSDoc comments
- Add tests for new features

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Include both positive and negative test cases
- Test edge cases and error handling

## Documentation

- Update README.md if needed
- Document new features in /docs
- Include JSDoc comments for new functions
- Update API documentation for new endpoints

