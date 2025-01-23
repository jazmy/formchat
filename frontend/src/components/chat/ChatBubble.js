import React from 'react';
import { Box, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatBubble = ({ 
  message, 
  role = 'assistant',
  isLoading,
  isCompletion,
  isOutput,
  isValidation,
  isAccepted,
  isQuestion
}) => {
  const theme = useTheme();
  const elevation = role === 'user' ? 1 : 0;
  let backgroundColor = theme.palette.background.paper;
  let textColor = theme.palette.text.primary;

  // Set colors based on role and type
  if (role === 'user') {
    backgroundColor = theme.palette.primary.light;
    textColor = theme.palette.primary.contrastText;
  } else if (isOutput) {
    backgroundColor = '#f5f5f5';  // Light gray that matches app's clean look
    textColor = theme.palette.text.primary;  // Default text color for consistency
  } else if (isCompletion) {
    backgroundColor = '#e8f5e9';  // Keep the nice green for completion
    textColor = '#1b5e20';  // Keep the dark green for completion
  } else if (isQuestion) {
    backgroundColor = '#e3f2fd';  // Light blue for questions
    textColor = theme.palette.text.primary;
  } else if (isValidation) {
    backgroundColor = theme.palette.grey[100];
  }

  const maxWidth = isOutput ? '100%' : '80%';

  if (isLoading) {
    return (
      <Box
        role="listitem"
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          mb: 2
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: theme.palette.grey[100],
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CircularProgress size={20} />
          <Typography color="text.secondary">Thinking...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      role="listitem"
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
        mb: 2,
        position: 'relative'
      }}
    >
      {isAccepted && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            boxShadow: theme.shadows[2],
            marginRight: 1,
            flexShrink: 0
          }}
        >
          <CheckIcon />
        </Box>
      )}
      <Paper
        elevation={elevation}
        sx={{
          p: 2,
          backgroundColor,
          color: textColor,
          maxWidth,
          borderRadius: 2,
          width: isOutput ? '100%' : 'auto',
          ...(isOutput && {
            border: '1px solid #e0e0e0',  // Subtle gray border
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '& code': {
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
            }
          }),
          ...(isCompletion && {
            border: '1px solid #c8e6c9',  // Keep the nice green border
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          })
        }}
      >
        <ReactMarkdown
          children={message}
          remarkPlugins={[remarkGfm]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={materialLight}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default ChatBubble;