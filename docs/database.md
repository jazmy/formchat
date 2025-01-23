# Database Schema

## Overview

FormChat uses SQLite3 as its database engine, managed through Knex.js query builder. The schema is designed to efficiently store forms, prompts, responses, and application settings.

## Tables

### Settings
Stores application-wide settings.
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Forms
Stores form definitions and metadata.
```sql
CREATE TABLE forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  welcome_message TEXT,
  completion_message TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  settings JSON
);
```

### Prompts
Stores individual questions/prompts within forms.
```sql
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  variable TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  required BOOLEAN DEFAULT TRUE,
  validation TEXT,
  guidance TEXT,
  order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settings JSON
);
```

### Responses
Stores user responses to forms.
```sql
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  data JSON NOT NULL,
  metadata JSON,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Response Items
Stores individual prompt responses within a form response.
```sql
CREATE TABLE response_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_id INTEGER REFERENCES responses(id) ON DELETE CASCADE,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE SET NULL,
  value TEXT NOT NULL,
  validation_result JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Relationships

### Form-Prompt Relationship
- One-to-Many: A form can have multiple prompts
- Foreign Key: `prompts.form_id` references `forms.id`
- Cascade Delete: When a form is deleted, all its prompts are deleted

### Form-Response Relationship
- One-to-Many: A form can have multiple responses
- Foreign Key: `responses.form_id` references `forms.id`
- Cascade Delete: When a form is deleted, all its responses are deleted

### Response-ResponseItem Relationship
- One-to-Many: A response can have multiple response items
- Foreign Key: `response_items.response_id` references `responses.id`
- Cascade Delete: When a response is deleted, all its items are deleted

## Data Types

### JSON Fields
The following fields store JSON data:
- `forms.settings`: Form-specific settings like validation rules, AI behavior
- `prompts.settings`: Prompt-specific settings like validation options
- `responses.data`: Complete response data including all prompt responses
- `responses.metadata`: Additional metadata like user agent, timestamps
- `response_items.validation_result`: AI validation results and feedback

### Text Fields
- All string fields use SQLite's TEXT type for maximum flexibility
- `prompts.type`: Defines prompt type (text, number, email, etc.)
- `prompts.variable`: Variable name for response data mapping
- `prompts.validation`: Validation rules in JSON string format
- `prompts.guidance`: AI guidance rules in JSON string format

## Indexes

### Primary Keys
- All tables use INTEGER PRIMARY KEY AUTOINCREMENT
- Provides efficient record lookup and relationships

### Foreign Keys
- `prompts.form_id`
- `responses.form_id`
- `response_items.response_id`
- `response_items.prompt_id`

### Additional Indexes
```sql
-- Forms
CREATE INDEX idx_forms_active ON forms(active);
CREATE INDEX idx_forms_created_at ON forms(created_at);

-- Prompts
CREATE INDEX idx_prompts_form_id ON prompts(form_id);
CREATE INDEX idx_prompts_order ON prompts(form_id, order);

-- Responses
CREATE INDEX idx_responses_form_id ON responses(form_id);
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_responses_completed ON responses(completed);

-- Response Items
CREATE INDEX idx_response_items_response ON response_items(response_id);
CREATE INDEX idx_response_items_prompt ON response_items(prompt_id);
```

## Performance Considerations

1. **Write-Ahead Logging (WAL)**
   ```sql
   PRAGMA journal_mode=WAL;
   ```

2. **Foreign Key Support**
   ```sql
   PRAGMA foreign_keys=ON;
   ```

3. **Synchronous Setting**
   ```sql
   PRAGMA synchronous=NORMAL;
   ```

4. **Cache Size**
   ```sql
   PRAGMA cache_size=-2000; -- 2MB cache
   ```

5. **Regular Maintenance**
   ```sql
   VACUUM;
   ANALYZE;
   ```
