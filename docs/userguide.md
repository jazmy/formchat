# FormChat User Guide

Welcome to FormChat! This guide will help you navigate our conversational form management system.

## Table of Contents
- [Getting Started](#getting-started)
- [Creating Forms](#creating-forms)
- [Filling Forms](#filling-forms)
- [Managing Responses](#managing-responses)
- [Settings](#settings)
- [Admin Settings](#admin-settings)
- [Troubleshooting](#troubleshooting)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Updates and Changes](#updates-and-changes)

## Getting Started

### Accessing FormChat
1. Open your web browser and navigate to your FormChat instance
2. Log in using your credentials
3. You'll be directed to the dashboard

### Dashboard Overview
- **Forms**: List of your created forms
- **Responses**: View form submissions
- **Settings**: Configure system settings

### Navigation
- Use the sidebar menu to access different sections
- Use the back button to return to previous pages
- Use breadcrumbs for navigation between sections

## Creating Forms

### Starting a New Form
1. Click "Create Form" in the dashboard
2. Enter form details:
   - Title: Name of your form
   - Description: Brief overview of the form's purpose
   - Starter Prompt: Hidden instructions for the AI to guide the chat experience
   - Output Prompt: Final message or instructions for generating output (optional)

### Adding Questions
1. Click "Add Question" in the form editor
2. Configure each question:
   - Question Text: The actual question to ask
   - Variable Name: Unique identifier for the response
   - Validation Criteria: Rules for validating the answer
   - Order: Question sequence number

### Question Configuration
- **Question Text**
  - Be clear and specific
  - Can include context or examples
  - Supports basic formatting

- **Variable Names**
  - Must be unique within the form
  - Used as column headers in exported results
  - Used for response identification
  - No spaces or special characters
  - Choose clear, descriptive names for easy data analysis
  - Examples: 
    - "user_name" for name responses
    - "feedback_score" for ratings
    - "improvement_suggestions" for feedback
  - These names will appear as headers in your exported data

- **Validation Criteria**
  - Hidden instructions for the AI to validate responses
  - Only visible to the AI, not to users
  - Leave blank to skip validation
  - Guides the AI on how to evaluate answers
  - Examples:
    - "Check if the response includes at least three specific examples from the event. The response should be detailed and mention concrete aspects rather than general impressions."
    - "Verify that the technical description includes: programming language used, framework version, and specific error messages encountered. Response should be at least 50 words."
    - "Ensure the feedback contains both positive aspects and areas for improvement. Each point should be specific and actionable. Reject vague or general responses."
    - "Validate that the response includes quantitative metrics (e.g., time saved, cost reduction, efficiency improvement) and qualitative benefits. Both aspects must be present."
    - "Check if the user story follows the format: 'As a [role], I want [feature] so that [benefit]'. All three components must be clearly stated."

### Form Flow Configuration
1. **Starter Prompt**
   - Hidden instructions only visible to the AI
   - Guides how the AI should interact with users
   - Sets the tone and style of responses
   - Defines validation approach
   - Examples:
     - "Act as a friendly interviewer gathering feedback. Encourage detailed responses and ask follow-up questions when answers are too brief."
     - "Be concise and formal. Focus on extracting specific technical details. If users provide incomplete information, ask them to elaborate on missing technical aspects."
     - "Take on a helpful customer service role. Guide users through the form while maintaining a positive, supportive tone. If users seem confused, offer clarification."

2. **Questions Sequence**
   - Drag and drop to reorder
   - Questions appear in defined order
   - Cannot skip questions during form filling

3. **Output Prompt**
   - Defines how to process all responses
   - Used for generating summaries or reports
   - Example: "Generate a detailed summary of the feedback, highlighting key positive aspects and areas for improvement."

### Form Settings
- **Access**: Forms are accessible via unique URL
- **Status**: Toggle form active/inactive
- **Order**: Questions appear in defined sequence
- **Validation**: AI-powered response validation

### Testing Your Form
1. Save the form
2. Use the preview option
3. Test all questions
4. Verify validation works
5. Check starter and output prompts

## Filling Forms

### Starting a Form Session
1. Open the form link
2. Read the welcome message
3. Begin answering questions

### Chat Interface
- Type your answers in the chat box
- Use Enter to send
- Use Shift+Enter for new line
- Wait for AI validation after each response

### Response Actions
After submitting an answer, you can:
- **Accept Suggestion**: Use AI-improved version
- **Keep Original**: Use your exact answer
- **Ask Question**: Get clarification
- **Edit**: Modify your answer
- **Try Again**: Start over

### Navigation
- Questions appear in sequence
- Progress bar shows completion status
- Current question number is displayed
- Cannot skip questions (must answer in order)

## Managing Responses

### Viewing Responses
1. Go to "Responses" in dashboard
2. Select a form to view its submissions
3. Click a response to see details

### Response Actions
- **View**: See complete response details
- **Export**: Download responses (JSON format)
- **Delete**: Remove individual responses

### Basic Analytics
- View total responses
- See completion status
- Check submission timestamps

## Settings

### System Configuration
- **OpenAI API**: Configure API key
- **Models**: Select AI models for different operations:
  - Chat model
  - Validation model
  - Welcome message model

### Processing Settings
- **Max Tokens**: Configure token limits for:
  - Chat responses
  - Validation
  - Welcome messages
- **Temperature**: Adjust AI response creativity
- **Rate Limits**: Set request limits

### Security
- JWT-based authentication
- Basic rate limiting
- Session management

### Chat Processing Settings

#### Token Limits
These settings control the maximum length of AI responses:

- **Conversational Max Tokens (Default: 1000)**
  - Controls the length of general chat responses
  - Higher values allow for longer, more detailed responses
  - Lower values keep responses concise

- **Welcome Max Tokens (Default: 100)**
  - Controls the length of initial greeting messages
  - Lower value keeps introductions brief and focused
  - Typically doesn't need to be very high since welcomes are short

- **Validation Max Tokens (Default: 1000)**
  - Controls how detailed the AI's validation feedback can be
  - Higher values allow for more detailed explanations of why a response might be invalid
  - Lower values give more concise validation messages

- **Guidance Max Tokens (Default: 1000)**
  - Controls the length of help and guidance messages
  - Higher values allow AI to provide more detailed assistance
  - Lower values keep help messages brief

#### Temperature Settings
Temperature controls how creative vs precise the AI responses are:

- **Conversational Temperature (Default: 0.7)**
  - Controls creativity in general chat
  - 0.7 provides a good balance between creativity and focus
  - Higher values (closer to 1.0) make responses more varied and creative
  - Lower values make responses more consistent and focused

- **Welcome Temperature (Default: 0.7)**
  - Controls variation in greeting messages
  - 0.7 allows for friendly, natural-sounding welcomes
  - Keeps greetings engaging while maintaining professionalism

- **Validation Temperature (Default: 0.3)**
  - Lower temperature for more consistent validation
  - 0.3 ensures strict, precise validation feedback
  - Lower value helps maintain consistent validation standards

- **Guidance Temperature (Default: 0.7)**
  - Controls creativity in help messages
  - 0.7 allows for helpful yet natural-sounding guidance
  - Balances between strict instruction and friendly assistance

Note: Changes to these settings take effect immediately. If you're unsure, start with the default values and adjust based on your needs.

## Admin Settings

To access the admin settings:
1. Log in as an administrator
2. Click the "Settings" link in the admin navigation menu

### Changing Admin Password
1. In the Security section, click "Change Password"
2. Enter your current password
3. Enter and confirm your new password
4. Click "Update Password"

### OpenAI API Configuration
1. In the API Settings section, enter your OpenAI API key
2. The key will be securely stored and used for all AI interactions
3. This key takes priority over any API key set in the environment variables
4. If you need a new API key, visit [OpenAI's website](https://platform.openai.com/api-keys)

Note: If no key is set in the admin settings, the system will fall back to using the OPENAI_API_KEY from your environment variables.

### Token Limits
Adjust these settings based on your usage needs:
1. Click "Token Settings"
2. Set limits for:
   - Maximum tokens per response (default: 1000)
   - Welcome message tokens (default: 100)
   - Validation tokens (default: 1000)
3. Click "Save Changes"

### Rate Limiting
Control API usage to manage costs:
1. Set maximum requests per minute
2. Set maximum tokens per minute
3. Click "Update Limits"

Note: If you hit rate limits, the system will queue requests until capacity is available.

## Troubleshooting

### Common Issues

#### Form Creation
**Problem**: Can't save form
- Check all required fields
- Verify question configuration
- Ensure valid variable names

**Problem**: Questions not saving
- Check network connection
- Verify form ID exists
- Ensure valid input format

#### Form Submission
**Problem**: Can't submit answers
- Check required fields
- Verify network connection
- Wait for AI validation

**Problem**: AI validation not working
- Check API key configuration
- Verify rate limits
- Ensure valid input

### Getting Help
- Check error messages
- Review logs
- Contact system administrator

## Keyboard Shortcuts

### Basic Navigation
- `Enter`: Submit answer
- `Shift + Enter`: New line in chat
- `Esc`: Clear current input

## Updates and Changes
This guide is updated as new features are implemented. Check with your administrator for the latest version of FormChat installed in your environment.
