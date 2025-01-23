import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, LinearProgress, Typography, Button } from '@mui/material';
import { Check as CheckIcon, Save as SaveIcon, Help as HelpIcon, Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ChatInput from './ChatInput';
import ChatBubble from './ChatBubble';
import ResponseActions from './ResponseActions';
import TypingIndicator from './TypingIndicator';
import { getFormDetails, submitResponse, validateAnswer, generateOutput } from '../../utils/api';

const ChatForm = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showingResponseActions, setShowingResponseActions] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState({ answers: [] });
  const [completed, setCompleted] = useState(false);
  const [currentResponseId, setCurrentResponseId] = useState(null);
  const [isInQuestionMode, setIsInQuestionMode] = useState(false);
  const chatContainerRef = useRef(null);

  // Calculate progress
  const totalQuestions = form ? form.prompts.filter(p => !p.is_output_prompt).length : 0;
  const currentQuestionNumber = form?.prompts[currentPromptIndex]?.is_output_prompt ? totalQuestions : Math.min(currentPromptIndex + 1, totalQuestions);
  const progress = form ? ((currentQuestionNumber) / totalQuestions) * 100 : 0;

  // Load form on mount
  useEffect(() => {
    const loadForm = async () => {
      if (!formId) {
        setMessages([{
          role: 'assistant',
          text: 'Error: No form ID provided',
          isError: true
        }]);
        return;
      }

      try {
        setIsLoading(true);
        const formData = await getFormDetails(formId);
        
        if (!formData) {
          throw new Error('Form not found');
        }

        setForm(formData);
        
        // Initialize chat with first question
        if (formData?.prompts?.[0]) {
          setMessages([
            {
              role: 'assistant',
              text: formData.title,
              isTitle: true
            },
            {
              role: 'assistant',
              text: formData.description,
              isDescription: true
            },
            {
              role: 'assistant',
              text: formData.prompts[0].question_text
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading form:', error);
        setMessages([{
          role: 'assistant',
          text: 'Sorry, there was an error loading the form. Please try refreshing the page.',
          isError: true
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to build context for the AI
  const buildAIContext = () => {
    return {
      title: form.title,
      description: form.description,
      currentPrompt: form.prompts[currentPromptIndex].question_text,
      previousQuestions: form.prompts.slice(0, currentPromptIndex).map(p => p.question_text),
      previousAnswers: responses.answers
    };
  };

  const handleAskQuestion = () => {
    // Clear validation state
    setShowingResponseActions(false);
    // Set mode to question
    setIsInQuestionMode(true);
    setCurrentAnswer(''); // Clear the current answer when entering question mode
    // Add context message
    setMessages(prev => [
      ...prev.filter(m => !m.isValidation),
      {
        role: 'assistant',
        text: 'What would you like to know? I can help explain the question or provide guidance.',
        isQuestion: true
      }
    ]);
  };

  const handleQuestionSubmit = async (question) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Add user's question to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          text: question,
          isQuestion: true
        }
      ]);

      // Show typing indicator
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Thinking...',
          isLoading: true
        }
      ]);

      // Get AI response
      const context = buildAIContext();
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.status}`);
      }

      const data = await response.json();

      // Remove loading message
      setMessages(prev => prev.filter(m => !m.isLoading));

      // Add AI response
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.response,
          isQuestion: true
        },
        {
          role: 'assistant',
          text: 'Would you like to ask another question or return to answering the form?',
          isQuestion: true,
          showActions: true,
          questionId: Date.now()
        }
      ]);

    } catch (error) {
      console.error('Error handling question:', error);
      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        {
          role: 'assistant',
          text: 'Sorry, there was an error processing your question. Please try again.',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToAnswer = () => {
    setIsInQuestionMode(false);
    setCurrentAnswer(''); // Clear the current answer when returning to form
    // Update messages to hide all Return to Question buttons
    setMessages(prev => prev.map(msg => ({
      ...msg,
      showActions: false // Hide all action buttons
    })));
    // Add the question message
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: form.prompts[currentPromptIndex].question_text
      }
    ]);
  };

  const handleSubmit = async (answer) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (isInQuestionMode) {
        await handleQuestionSubmit(answer);
        return;
      }

      // Add user message to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          text: answer
        }
      ]);

      // Get current prompt
      const currentPrompt = form.prompts[currentPromptIndex];

      // Show typing indicator
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Thinking...',
          isLoading: true
        }
      ]);

      // Check if this is accepting a suggestion
      const isSuggestion = answer.startsWith('accept suggestion');
      if (isSuggestion) {
        // Extract the suggestion from the message
        const suggestion = answer.split('accept suggestion')[1].trim();
        // Remove typing indicator
        setMessages(prev => prev.filter(msg => !msg.isLoading));
        // Directly accept the suggestion
        await handleAcceptedAnswer(suggestion);
        return;
      }

      // Validate the response
      const validationResponse = await validateAnswer(
        formId,
        currentPromptIndex,
        answer,
        currentPrompt.validation_criteria
      );

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isLoading));

      if (validationResponse.error) {
        console.error('Validation error:', validationResponse.error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: 'Sorry, there was an error validating your response. Please try again.',
            isError: true
          }
        ]);
        return;
      }

      const validationMessage = validationResponse.validation;
      if (!validationMessage) {
        // Valid response, proceed with form
        await handleAcceptedAnswer(answer);
        return;
      }

      // Add validation message to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: validationMessage,
          isValidation: true
        }
      ]);

      // Show response actions if we have a suggestion
      setShowingResponseActions(true);
      setCurrentAnswer(answer);

    } catch (error) {
      console.error('Error handling message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, there was an error processing your response. Please try again.',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptedAnswer = async (answer) => {
    try {
      // Remove any existing validation messages and the last user message
      setMessages(prev => prev.filter(m => !m.isValidation && !(m.role === 'user' && !m.isAccepted)));

      // Add accepted message if it doesn't exist
      setMessages(prev => {
        const hasAcceptedMessage = prev.some(m => m.role === 'user' && m.isAccepted && m.text === answer);
        if (!hasAcceptedMessage) {
          return [...prev, {
            role: 'user',
            text: answer,
            isAccepted: true
          }];
        }
        return prev;
      });

      // Create new answer object
      const currentPrompt = form.prompts[currentPromptIndex];
      const newAnswer = {
        variable_name: currentPrompt.variable_name,
        response_text: answer
      };

      // Update answers array
      const updatedAnswers = [
        ...responses.answers.filter(a => a.variable_name !== currentPrompt.variable_name),
        newAnswer
      ];

      try {
        // Save to backend with the current response ID
        console.log('Submitting with responseid:', currentResponseId);
        const response = await submitResponse(formId, { 
          responseid: currentResponseId,
          answers: updatedAnswers 
        });

        // Update response ID if needed
        if (!response) {
          throw new Error('No response received from server');
        }
        
        console.log('Got response:', response);
        
        if (response.responseid) {
          console.log('Got response ID:', response.responseid);
          if (!currentResponseId) {
            console.log('Setting new response ID');
            setCurrentResponseId(response.responseid);
          } else if (currentResponseId !== response.responseid) {
            console.error('Response ID mismatch:', { current: currentResponseId, received: response.responseid });
          }
        } else {
          console.error('No response ID in response:', response);
          throw new Error('No response ID received');
        }

        // Update local state
        setResponses({ answers: updatedAnswers });
      } catch (error) {
        console.error('Error saving response:', error);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: 'Sorry, there was an error saving your response. Please try again.',
            isError: true
          }
        ]);
        return;
      }

      // Move to next question
      const nextIndex = currentPromptIndex + 1;
      setCurrentPromptIndex(nextIndex);
      
      // Add next question if available
      if (form.prompts[nextIndex]) {
        setMessages(prev => [
          ...prev.filter(m => !m.isValidation), // Clear validation messages
          {
            role: 'assistant',
            text: form.prompts[nextIndex].question_text
          }
        ]);
      } else if (form.output_prompt) {
        // Show generating output message
        setMessages(prev => [
          ...prev.filter(m => !m.isValidation),
          {
            role: 'assistant',
            text: 'Generating your output based on all responses...',
            isLoading: true
          }
        ]);
        
        try {
          // Generate the output
          const outputResponse = await generateOutput(formId, { answers: updatedAnswers });
          
          if (outputResponse.output) {
            // Add output to answers and save
            const outputAnswer = {
              variable_name: 'output',
              response_text: outputResponse.output
            };
            
            const answersWithOutput = [...updatedAnswers, outputAnswer];
            
            // Save to backend with output
            await submitResponse(formId, {
              responseid: currentResponseId,
              answers: answersWithOutput
            });
            
            setResponses({ answers: answersWithOutput });
            
            setMessages(prev => [
              ...prev.filter(m => !m.isLoading),
              {
                role: 'assistant',
                text: 'Based on your responses, here is the generated output:',
                isOutput: true
              },
              {
                role: 'assistant',
                text: outputResponse.output,
                isOutput: true
              },
              {
                role: 'assistant',
                text: 'Thank you for completing the form! Your responses have been saved successfully.',
                isCompletion: true
              }
            ]);
            setCompleted(true);
          }
        } catch (error) {
          console.error('Error generating output:', error);
          setMessages(prev => [
            ...prev.filter(m => !m.isLoading),
            {
              role: 'assistant',
              text: 'Sorry, there was an error generating the output. Please try again.',
              isError: true
            }
          ]);
        }
      } else {
        // Form completed without output
        setMessages(prev => [
          ...prev.filter(m => !m.isValidation),
          {
            role: 'assistant',
            text: 'Thank you for completing the form! Your responses have been saved successfully.',
            isCompletion: true
          }
        ]);
        setCompleted(true);
      }

      setShowingResponseActions(false);
      setCurrentAnswer(null);

      // Scroll to bottom
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

    } catch (error) {
      console.error('Error in handleAcceptedAnswer:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, there was an error processing your answer. Please try again.',
          isError: true
        }
      ]);
    }
  };

  const handleAcceptSuggestion = () => {
    // Extract the suggestion from the last validation message
    const lastValidationMessage = messages.findLast(m => m.isValidation);
    if (!lastValidationMessage) return;

    const suggestion = extractSuggestion(lastValidationMessage.text);
    if (!suggestion) return;

    // Add the suggestion as a user message
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        text: suggestion
      }
    ]);

    // Directly accept without validation
    handleAcceptedAnswer(suggestion);
  };

  const handleUseOriginal = () => {
    // Find the last user message before validation
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(m => m.role === 'user');
    
    if (!lastUserMessage) return;

    // Directly accept without validation
    handleAcceptedAnswer(lastUserMessage.text);
  };

  const handleReviseAnswer = () => {
    // Find the last user message
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(m => m.role === 'user');
    // Set current answer for pre-population
    setCurrentAnswer(lastUserMessage?.text || '');
    // Clear validation state and messages
    setShowingResponseActions(false);
    setMessages(prev => prev.filter(m => !m.isValidation));
    // Make sure we're not in question mode
    setIsInQuestionMode(false);
  };

  // Helper function to extract suggestion from validation message
  const extractSuggestion = (text) => {
    const lines = text.split('\n');
    const suggestionLine = lines.find(line => line.trim().startsWith('1.'));
    if (!suggestionLine) return null;

    const match = suggestionLine.match(/"([^"]+)"/);
    return match ? match[1] : suggestionLine.substring(3).trim();
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Progress bar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'background.paper' }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4CAF50'
            }
          }} 
        />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          px: 2, 
          py: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="body2" color="textSecondary">
            Question {currentQuestionNumber} of {totalQuestions}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {Math.round(progress)}% complete
          </Typography>
        </Box>
      </Box>

      {/* Chat messages */}
      <Box 
        ref={chatContainerRef}
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <ChatBubble
              message={message.text}
              role={message.role}
              isLoading={message.isLoading}
              isCompletion={message.isCompletion}
              isOutput={message.isOutput}
              isValidation={message.isValidation}
              isAccepted={message.isAccepted}
              isQuestion={message.isQuestion}
            />
            {message.showActions && isInQuestionMode && message.questionId && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleReturnToAnswer();
                    // Immediately update this specific message to hide its button
                    setMessages(prev => prev.map(msg => 
                      msg.questionId === message.questionId ? { ...msg, showActions: false } : msg
                    ));
                  }}
                  startIcon={<ArrowBackIcon />}
                >
                  Return to Question
                </Button>
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Input area */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
        {showingResponseActions ? (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            p: 1, 
            mb: 2,
            bgcolor: 'grey.100',
            borderRadius: 1
          }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleAcceptSuggestion}
              startIcon={<CheckIcon />}
            >
              Accept Suggestion
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleUseOriginal}
              startIcon={<SaveIcon />}
            >
              Use my Original
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={handleAskQuestion}
              startIcon={<HelpIcon />}
            >
              Ask Question
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReviseAnswer}
              startIcon={<EditIcon />}
            >
              Revise Answer
            </Button>
          </Box>
        ) : null}
        
        {/* Always show input unless completed or showing response actions */}
        {!completed && !showingResponseActions && (
          <ChatInput 
            onSubmit={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            placeholder={isInQuestionMode ? "Type your question..." : "Type your answer..."}
            defaultValue={isInQuestionMode ? "" : currentAnswer}
          />
        )}
      </Box>
    </Box>
  );
};

export default ChatForm;