# FormChat Component Documentation

## Component Structure

```
components/
├── admin/
│   ├── AdminDashboard.js
│   ├── AdminLayout.js
│   ├── AdminLogin.js
│   ├── AdminSettings.js
│   ├── FormBuilder.js
│   ├── FormList.js
│   └── FormResponses.js
├── chat/
│   ├── ChatBubble.js
│   ├── ChatForm.js
│   ├── ChatInput.js
│   ├── ResponseActions.js
│   └── TypingIndicator.js
└── common/
    ├── DragDropWrapper.js
    └── PrivateRoute.js
```

## Chat Components

### ChatForm
The main container component that manages the chat-based form interaction.

#### State
```javascript
{
  form: Object,                    // Form configuration and prompts
  messages: Array,                 // Chat message history
  isLoading: Boolean,             // Loading state for API calls
  showingResponseActions: Boolean, // Controls response action buttons
  currentAnswer: String,          // Current user input
  currentPromptIndex: Number,     // Current form prompt index
  responses: { answers: Array },  // Collected form responses
  completed: Boolean,             // Form completion status
  currentResponseId: String,      // Current response session ID
  isInQuestionMode: Boolean       // Question mode toggle
}
```

#### Key Methods
- `handleSubmit(text)`: Process user input
- `handleAcceptedAnswer(answer)`: Save accepted answer
- `handleAcceptSuggestion()`: Accept AI suggestion
- `handleUseOriginal()`: Use original answer
- `handleAskQuestion()`: Toggle question mode
- `handleReviseAnswer()`: Allow answer revision
- `handleTryAgain()`: Reset current question

### ChatBubble
Renders individual chat messages with different styles based on the role and type.

#### Props
```javascript
{
  message: Object,     // Message content and metadata
  role: String,        // 'assistant' or 'user'
  isLoading: Boolean,  // Show loading state
  isCompletion: Boolean,
  isOutput: Boolean,
  isValidation: Boolean,
  isAccepted: Boolean,
  isQuestion: Boolean
}
```

#### Features
- Markdown rendering
- Code syntax highlighting
- Loading animation
- Success indicators
- Role-based styling

### ChatInput
Text input component for user responses with keyboard shortcuts.

#### Props
```javascript
{
  onSubmit: Function,
  disabled: Boolean,
  loading: Boolean,
  placeholder: String,
  defaultValue: String
}
```

#### Features
- Character limit display
- Enter to submit
- Shift+Enter for new line
- Loading state
- Disabled state

### ResponseActions
Action buttons for handling user responses.

#### Props
```javascript
{
  onAccept: Function,
  onTryAgain: Function,
  onUseOriginal: Function,
  currentAnswer: String
}
```

### TypingIndicator
Animated indicator showing when the AI is "typing".

## Admin Components

### AdminDashboard
Main admin interface showing form statistics and recent activity.

### AdminLayout
Layout wrapper for admin pages with navigation and authentication.

### FormBuilder
Interactive form builder with drag-and-drop prompt management.

### FormList
List view of all forms with search and filtering.

### FormResponses
View and export form responses with filtering options.

### AdminSettings
System configuration and user management interface.

## Common Components

### DragDropWrapper
Wrapper component for drag-and-drop functionality.

#### Props
```javascript
{
  onDragEnd: Function,
  children: Node
}
```

### PrivateRoute
Route wrapper for authentication protection.

#### Props
```javascript
{
  component: Component,
  ...rest: Object  // Other React Router props
}
```

## Best Practices

1. All components use functional components with hooks
2. Props are documented using PropTypes
3. Components follow single responsibility principle
4. Shared logic is extracted into custom hooks
5. Material-UI components are used for consistent styling

## Styling

### Theme Integration
Components use Material-UI's theme system for consistent styling:

```javascript
{
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    success: {
      main: '#4caf50',
      light: '#81c784'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5'
    }
  }
}
```

### Layout Guidelines
- Maximum width for chat bubbles: 80%
- Full width for output messages
- Consistent padding and margins
- Responsive design breakpoints

## State Management

### Form State
```javascript
{
  id: String,             // Form ID
  title: String,          // Form title
  prompts: Array,         // Questions
  output_prompt: String   // Output template
}
```

### Message State
```javascript
{
  role: String,           // Message sender
  text: String,           // Message content
  isLoading: Boolean,     // Loading state
  isCompletion: Boolean,  // Is completion
  isOutput: Boolean,      // Is output
  isValidation: Boolean,  // Is validation
  isAccepted: Boolean     // Is accepted
}
```

### Response State
```javascript
{
  answers: Array,         // User answers
  responseId: String      // Response ID
}
```
