# Form Management

## Overview

FormChat provides a powerful form management system that allows you to create, edit, and manage conversational forms. Forms are presented as natural conversations rather than traditional form fields, making them more engaging and user-friendly.

## Features

### Form Creation
- Intuitive form builder interface
- Multiple prompt types
- Custom validation rules
- Variable name mapping
- Form preview functionality
- Drag-and-drop ordering

### Form Settings
- Form title and description
- Access control (public/private)
- Response limit settings
- Start and end dates
- Form status (draft/active/archived)
- Custom welcome message
- Output prompt configuration
- AI model settings

### Prompt Types
1. **Question Prompts**
   - Question text
   - Variable name (for data mapping)
   - Validation criteria
   - Help text
   - Optional/Required setting

2. **System Prompts**
   - Welcome messages
   - Section introductions
   - Transition text
   - Instructions

3. **Output Prompts**
   - Final output template
   - Response variable mapping
   - Markdown formatting
   - Dynamic content

## Validation System

### AI-Powered Validation
- Real-time response validation
- Context-aware feedback
- Custom validation rules
- Previous answer context
- Quality assessment

### Validation Settings
- Required/Optional fields
- Custom validation criteria
- Response quality thresholds
- Retry attempts allowed
- Help system integration

## Data Management

### Form Structure
```typescript
interface Form {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  settings: {
    isPublic: boolean;
    responseLimit: number;
    startDate?: Date;
    endDate?: Date;
    welcomeMessage?: string;
    outputPrompt?: string;
  };
  prompts: Array<{
    id: string;
    type: 'question' | 'system' | 'output';
    questionText: string;
    variableName?: string;
    validationCriteria?: string;
    helpText?: string;
    isRequired: boolean;
    order: number;
  }>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    responseCount: number;
  };
}
```

### Database Schema
```sql
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL
);

CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  variable_name TEXT,
  validation_criteria TEXT,
  help_text TEXT,
  is_required BOOLEAN DEFAULT true,
  order_position INTEGER NOT NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id)
);
```

## Form Management

### Access Control
- Role-based permissions
- Public/Private forms
- Response limits
- Date restrictions

### Form Operations
- Create new forms
- Edit existing forms
- Preview forms
- Archive forms
- Delete forms
- Duplicate forms

### Prompt Management
- Add/Edit prompts
- Reorder prompts
- Delete prompts
- Preview prompts
- Test validation

## Response Handling

### Collection
- Real-time validation
- Progress tracking
- Session management
- Error recovery

### Storage
- Secure data storage
- Response metadata
- User information
- Validation history

### Export Options
- CSV export
- JSON format
- Response filtering
- Custom data mapping

## Best Practices

### Form Design
1. **Clear Structure**
   - Logical prompt order
   - Clear instructions
   - Consistent formatting
   - Progressive disclosure

2. **Validation Rules**
   - Specific criteria
   - Helpful error messages
   - Reasonable limits
   - Context consideration

3. **User Experience**
   - Natural conversation flow
   - Helpful guidance
   - Error recovery
   - Progress indication

### Security
1. **Access Control**
   - User authentication
   - Role permissions
   - Data encryption
   - Session management

2. **Data Protection**
   - Input sanitization
   - XSS prevention
   - CSRF protection
   - Rate limiting

3. **Audit Trail**
   - Action logging
   - Change tracking
   - Error logging
   - Access monitoring
