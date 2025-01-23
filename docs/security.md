# Security Policy

## Supported Versions

Currently, we only support the latest version of FormChat with security updates.

## Security Features

FormChat implements the following security measures:

### Authentication
- JWT-based authentication for admin access
- Secure password storage using bcrypt hashing
- Salt-based password protection

### Configuration Security
- Environment variable-based configuration
- Sensitive data isolation
- OpenAI API key protection

### Data Security
- SQLite database with file permissions
- Input validation through OpenAI processing
- Secure form response storage

## Best Practices

### Environment Variables
1. Never commit `.env` files
2. Use strong, unique values for:
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
3. Restrict file permissions on `.env`

### Database Security
1. Ensure proper file permissions on SQLite database
2. Regular backups
3. Keep SQLite version updated

### API Security
1. Use HTTPS in production
2. Protect OpenAI API key
3. Validate form inputs

## Reporting Security Issues

If you discover a security vulnerability, please follow these steps:

1. **Do Not** open a public issue
2. Submit the issue through GitHub's private vulnerability reporting
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Recommendations

### Deployment
1. Use HTTPS
2. Set secure file permissions
3. Keep dependencies updated
4. Regular security updates

### Access Control
1. Use strong admin passwords
2. Regularly rotate JWT secret
3. Monitor failed login attempts

### Data Protection
1. Regular database backups
2. Sanitize user inputs
3. Validate form responses

## Development Guidelines

### Code Security
1. Keep dependencies updated
2. Follow secure coding practices
3. Review security implications of changes

### Testing
1. Test authentication flows
2. Validate input handling
3. Check error handling

## Acknowledgments

We appreciate the security community's efforts in responsibly disclosing vulnerabilities.
