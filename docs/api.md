# FormChat API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

All admin endpoints require JWT token authentication.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Error Handling

All endpoints follow a consistent error response format:
```json
{
  "error": "Error message",
  "details": "Optional detailed error message"  // Only in development
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found
- 500: Server Error

## Endpoints

### Authentication

#### Login
```
POST /auth/login

Request:
{
  "username": "string",
  "password": "string"
}

Response (200):
{
  "token": "string"  // JWT token valid for 24 hours
}

Error (400):
{
  "error": "Username and password are required"
}

Error (401):
{
  "error": "Invalid credentials"
}
```

#### Logout
```
POST /auth/logout

Response (200):
{
  "message": "Logged out successfully"
}
```

#### Change Password
```
POST /auth/change-password
Authorization: Required

Request:
{
  "currentPassword": "string",
  "newPassword": "string"  // Min 8 characters
}

Response (200):
{
  "message": "Password updated successfully"
}

Error (400):
{
  "message": "Current password and new password are required"
}

Error (401):
{
  "message": "Current password is incorrect"
}
```

### Forms

#### Create Form
```
POST /forms
Authorization: Required

Request:
{
  "title": "string",
  "description": "string",
  "starter_prompt": "string",
  "output_prompt": "string",
  "prompts": [
    {
      "question_text": "string",
      "variable_name": "string",
      "validation_criteria": "string",
      "order": number
    }
  ]
}

Response (200):
{
  "formId": number
}

Error (400):
{
  "error": "Title is required"
}
```

#### Get Form Details
```
GET /forms/:formId

Response (200):
{
  "formId": number,
  "title": "string",
  "description": "string",
  "starter_prompt": "string",
  "output_prompt": "string",
  "active": boolean,
  "prompts": [
    {
      "promptId": number,
      "question_text": "string",
      "variable_name": "string",
      "validation_criteria": "string",
      "order": number
    }
  ]
}
```

#### Update Form Progress
```
POST /forms/:formId/progress

Request:
{
  "answers": [
    {
      "promptId": number,
      "answer": "string"
    }
  ]
}

Response (200):
{
  "status": "success",
  "progress": number  // Percentage complete
}
```

#### Delete Form
```
DELETE /forms/:formId
Authorization: Required

Response (200):
{
  "message": "Form deleted successfully"
}
```

#### Export Form Responses
```
GET /forms/:formId/export?responseIds=1,2,3
Authorization: Required

Response (200):
Content-Type: text/csv
[CSV data of form responses]
```

### Responses

#### Submit Response
```
POST /responses
Authorization: Required

Request:
{
  "formId": number,
  "answers": [
    {
      "promptId": number,
      "answer": "string"
    }
  ]
}

Response (200):
{
  "responseId": number,
  "status": "success"
}
```

#### Get Response Details
```
GET /responses/:responseId
Authorization: Required

Response (200):
{
  "responseId": number,
  "formId": number,
  "answers": [
    {
      "promptId": number,
      "answer": "string",
      "timestamp": "string"
    }
  ]
}
```

### Settings

#### Get Settings
```
GET /settings
Authorization: Required

Response (200):
{
  "settings": {
    "key": "value"
  }
}
```

#### Update Settings
```
PUT /settings
Authorization: Required

Request:
{
  "settings": {
    "key": "value"
  }
}

Response (200):
{
  "message": "Settings updated successfully"
}
```

## Logging

All API endpoints include comprehensive logging:
- Request details
- Authentication attempts
- Validation failures
- Error conditions
- Performance metrics

Logs can be accessed via the admin dashboard or server logs.
