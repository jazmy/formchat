# Response Handling

## Overview

FormChat provides comprehensive response handling capabilities, from collection and validation to storage and export. This system ensures that form responses are properly processed, stored, and accessible for analysis.

## Response Collection

### Data Structure
```typescript
interface FormResponse {
  id: string;
  formId: string;
  userId?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  responses: Array<{
    promptId: string;
    variableName: string;
    questionText: string;
    responseText: string;
    validationResult: {
      isValid: boolean;
      feedback?: string;
      score?: number;
      attempts: number;
    };
    metadata: {
      startTime: Date;
      completionTime: Date;
      timeSpent: number;
      attempts: number;
    };
  }>;
  metadata: {
    startTime: Date;
    lastUpdateTime: Date;
    completionTime?: Date;
    userAgent: string;
    ipAddress: string;
    totalTimeSpent: number;
  };
}
```

### Collection Process
1. Initialize response session
2. Collect individual answers
3. Validate responses
4. Store progress
5. Generate final output

## Response Processing

### Validation Flow
1. Real-time validation
2. AI-powered quality check
3. Custom criteria validation
4. Feedback generation
5. Progress tracking

### Session Management
- Auto-save functionality
- Progress restoration
- Timeout handling
- Error recovery
- State persistence

## Storage System

### Database Schema
```sql
CREATE TABLE form_responses (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  user_id TEXT,
  status TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id)
);

CREATE TABLE response_items (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  variable_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  validation_result JSON,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (response_id) REFERENCES form_responses(id),
  FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);
```

### Data Organization
- Hierarchical structure
- Response versioning
- Metadata tracking
- Validation history
- User session data

### Security Measures
- Data encryption
- Access control
- Input sanitization
- Audit logging
- Backup systems

## Response Access

### Admin Interface
- Response dashboard
- Search functionality
- Filtering options
- Bulk operations
- Analytics views

### API Endpoints
```typescript
// Get all responses
GET /api/forms/:formId/responses

// Get single response
GET /api/forms/:formId/responses/:responseId

// Update response status
PUT /api/forms/:formId/responses/:responseId/status

// Delete response
DELETE /api/forms/:formId/responses/:responseId

// Export responses
GET /api/forms/:formId/responses/export
```

## Export System

### Export Formats
1. **CSV**
   - All responses
   - Selected fields
   - Custom mapping
   - Metadata included

2. **JSON**
   - Full response data
   - Nested structure
   - Validation history
   - Metadata included

### Export Options
- Date range selection
- Field selection
- Format options
- Filtering criteria
- Sort order

## Analytics

### Response Metrics
- Completion rates
- Average time spent
- Validation success
- Attempt counts
- Abandonment rates

### Data Insights
- Response patterns
- Common issues
- Quality metrics
- User behavior
- Performance stats

## Best Practices

### Data Collection
1. **Validation**
   - Real-time checks
   - Clear feedback
   - Retry limits
   - Error handling

2. **Storage**
   - Regular backups
   - Data cleanup
   - Version control
   - Audit trails

3. **Security**
   - Data encryption
   - Access control
   - Input validation
   - Rate limiting

### Response Management
1. **Organization**
   - Clear labeling
   - Logical grouping
   - Search optimization
   - Version tracking

2. **Access Control**
   - Role-based access
   - Audit logging
   - Data retention
   - Export limits

3. **Performance**
   - Query optimization
   - Caching strategy
   - Batch processing
   - Load management
