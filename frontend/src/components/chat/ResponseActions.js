import React, { useState } from 'react';
import { Box, Button, TextField, ButtonGroup } from '@mui/material';
import { Check, Edit, Help, Send, Create, Close } from '@mui/icons-material';

const ResponseActions = ({ onAccept, onTryAgain, onUseOriginal, currentAnswer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [revisedAnswer, setRevisedAnswer] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [question, setQuestion] = useState('');

  // Reset states when switching modes
  const startEditing = () => {
    setIsEditing(true);
    setRevisedAnswer(currentAnswer || '');
  };

  const startAskingQuestion = () => {
    setIsAskingQuestion(true);
    setQuestion('');
  };

  if (isEditing) {
    return (
      <Box component="form" onSubmit={(e) => {
        e.preventDefault();
        onTryAgain();
      }} sx={{ width: '100%' }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          value={revisedAnswer}
          onChange={(e) => setRevisedAnswer(e.target.value)}
          placeholder="Type your revised answer..."
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setIsEditing(false)}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!revisedAnswer.trim()}
            startIcon={<Send />}
            fullWidth
          >
            Submit Revision
          </Button>
        </Box>
      </Box>
    );
  }

  if (isAskingQuestion) {
    return (
      <Box component="form" onSubmit={(e) => {
        e.preventDefault();
        onTryAgain();
      }} sx={{ width: '100%' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setIsAskingQuestion(false)}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={!question.trim()}
            startIcon={<Send />}
            fullWidth
          >
            Ask
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Main actions in a horizontal row */}
      <ButtonGroup 
        variant="contained" 
        sx={{ 
          display: 'flex',
          '& > button': {
            flex: 1,
            whiteSpace: 'nowrap'
          }
        }}
      >
        <Button
          color="success"
          startIcon={<Check />}
          onClick={onAccept}
        >
          Accept Suggestion
        </Button>
        <Button
          color="warning"
          startIcon={<Check />}
          onClick={onUseOriginal}
        >
          Use my Original
        </Button>
        <Button
          color="info"
          startIcon={<Help />}
          onClick={startAskingQuestion}
        >
          Ask Question
        </Button>
        <Button
          color="secondary"
          startIcon={<Create />}
          onClick={startEditing}
        >
          Revise Answer
        </Button>
        <Button
          color="primary"
          startIcon={<Close />}
          onClick={onTryAgain}
          sx={{ 
            backgroundColor: 'grey.700',
            '&:hover': {
              backgroundColor: 'grey.800'
            }
          }}
        >
          Try Again
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default ResponseActions;
