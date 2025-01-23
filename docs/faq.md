# Frequently Asked Questions (FAQ)

## General Questions

### What is FormChat?
FormChat is an AI-powered conversational form builder that creates engaging, chat-based forms. It uses advanced natural language processing to provide an interactive experience, with real-time validation and contextual guidance.

### What are the main features?
- Conversational form interface with real-time AI validation
- Context-aware guidance and suggestions
- Dynamic form creation and management
- Real-time response validation and feedback
- Customizable form settings and validation rules
- Response analytics and export capabilities
- Multi-step form flows with branching logic
- Secure data handling and storage

### Is FormChat free to use?
FormChat is open-source and free to self-host. You'll need your own OpenAI API key for the AI features. The OpenAI API usage costs will depend on your form volume and complexity.

## Technical Questions

### What technologies does FormChat use?
- **Frontend**: React 18, TypeScript, Material-UI v5
- **Backend**: Node.js 18+, Express 4, TypeScript
- **Database**: SQLite3 with Knex.js
- **AI**: OpenAI GPT-4 API
- **Testing**: Jest, React Testing Library
- **Documentation**: OpenAPI/Swagger
- **Monitoring**: Custom metrics system

### How does the AI validation work?
1. Each form prompt can have AI validation rules
2. When a user responds, the answer is sent to OpenAI
3. The AI validates the response based on:
   - Context from previous answers
   - Form-specific validation rules
   - Response format requirements
4. The AI provides feedback and suggestions
5. Results are stored with the response

### Can I customize the AI behavior?
Yes, through several methods:
1. Form-level settings in the settings JSON
2. Prompt-specific validation rules
3. Custom guidance messages
4. Temperature and token settings
5. Model selection per prompt type

### How do I get an OpenAI API key?
1. Visit [OpenAI's website](https://platform.openai.com/signup)
2. Create an account and add payment method
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create new secret key
5. Add to your `.env` file as `OPENAI_API_KEY`

## Setup and Installation

### What are the system requirements?
- Node.js v18 or higher
- npm v9 or higher
- SQLite3
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 1GB RAM minimum
- 1GB disk space
- Internet connection for OpenAI API

### How do I install FormChat?
See [Installation Guide](installation.md) for detailed instructions. Quick start:
```bash
# Clone repository
git clone https://github.com/jazmy/formchat.git
cd formchat

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
npm run db:init

# Start development server
npm run dev
```

### How do I update FormChat?
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Clear cache (if needed)
npm cache clean --force

# Restart server
npm run dev
```

## Forms and Responses

### How do I create a new form?
1. Access the admin interface
2. Click "Create New Form"
3. Set form title and description
4. Add prompts with:
   - Question text
   - Variable name
   - Validation rules
   - AI guidance
5. Set form settings
6. Save and activate

### What prompt types are available?
- Text (short/long)
- Number
- Email
- Phone
- Date
- Multiple Choice
- Checkbox
- Scale
- File Upload
- Location
- Custom types

### How are responses stored?
- Each response has a unique session ID
- Responses are stored in the responses table
- Individual prompt responses in response_items
- Full response data as JSON
- Metadata includes timestamps and validation results

### Can I export responses?
Yes, in several formats:
- CSV
- JSON
- Excel
- PDF Report
- Custom format through API

## Security and Privacy

### How is data secured?
1. **Database Security**
   - SQLite with WAL mode
   - Regular backups
   - Data encryption at rest

2. **API Security**
   - Rate limiting
   - Input validation
   - CORS protection
   - Security headers

3. **Form Security**
   - Session management
   - Response encryption
   - Access controls
   - Audit logging

### What about data privacy?
1. **Data Storage**
   - Only store necessary data
   - Configurable retention
   - Secure deletion

2. **AI Processing**
   - No data retention by OpenAI
   - Minimal data transmission
   - Privacy-focused prompts

## Troubleshooting

### Common Issues

#### 1. OpenAI API Issues
- Check API key is valid
- Verify rate limits
- Monitor API usage
- Check error responses

#### 2. Database Issues
- Check file permissions
- Verify SQLite installation
- Run database migrations
- Check disk space

#### 3. Performance Issues
- Monitor memory usage
- Check response times
- Optimize database
- Adjust cache settings

### Error Messages

#### "OpenAI API Error"
1. Check API key
2. Verify network connection
3. Check rate limits
4. Review error details

#### "Database Error"
1. Check file permissions
2. Verify file path
3. Run migrations
4. Check disk space

#### "Validation Failed"
1. Check form settings
2. Review AI response
3. Verify input format
4. Check error details

## Performance

### How can I optimize performance?
1. **Database**
   - Enable WAL mode
   - Regular VACUUM
   - Index optimization
   - Connection pooling

2. **API**
   - Response caching
   - Rate limiting
   - Compression
   - Load balancing

3. **AI**
   - Batch processing
   - Response caching
   - Model selection
   - Token optimization

### What are the rate limits?
- Default: 100 requests per 15 minutes
- Configurable through settings
- Per-IP or per-user limiting
- Separate AI rate limits

## Support

### Where can I get help?
1. Documentation
   - Installation guide
   - API reference
   - Troubleshooting guide
   - Best practices

2. Community
   - GitHub issues
   - Discussion forum
   - Stack Overflow
   - Discord channel

3. Contributing
   - Bug reports
   - Feature requests
   - Pull requests
   - Documentation improvements
