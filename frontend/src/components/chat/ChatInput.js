import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Tooltip, CircularProgress, InputAdornment } from '@mui/material';
import { Send as SendIcon, Clear as ClearIcon } from '@mui/icons-material';

const MAX_LENGTH = 1000; // Maximum character length

const ChatInput = ({ onSubmit, disabled, loading, placeholder = "Type your answer...", defaultValue = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Update input value when defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      setInputValue(defaultValue);
      // Focus the input
      inputRef.current?.focus();
    }
  }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled || loading) return;

    onSubmit(inputValue.trim());
    setInputValue('');
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 2,
        position: 'relative',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease-in-out',
        boxShadow: document.activeElement === inputRef.current ? '0 -4px 20px rgba(0, 0, 0, 0.05)' : 'none',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, position: 'relative' }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={4}
          value={inputValue}
          onChange={(e) => {
            if (e.target.value.length <= MAX_LENGTH) {
              setInputValue(e.target.value);
            }
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || loading}
          variant="outlined"
          size="medium"
          InputProps={{
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
            'aria-label': 'Message input',
            maxLength: MAX_LENGTH,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              backgroundColor: 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
              },
            },
          }}
        />
        
        {inputValue && (
          <Tooltip title="Clear message (Esc)">
            <IconButton 
              onClick={handleClear}
              disabled={disabled || loading}
              size="large"
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary'
                }
              }}
            >
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Send message (Enter)">
          <span>
            <IconButton
              type="submit"
              color="primary"
              disabled={!inputValue.trim() || disabled || loading}
              size="large"
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Typography 
        variant="caption" 
        color={inputValue.length >= MAX_LENGTH ? 'error' : 'text.secondary'}
        align="right"
      >
        {inputValue.length}/{MAX_LENGTH}
      </Typography>
    </Box>
  );
};

export default ChatInput;