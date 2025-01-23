import React from 'react';
import { Box, Paper } from '@mui/material';

const TypingIndicator = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 2,
        maxWidth: '80%',
        alignSelf: 'flex-start',
        animation: 'fadeIn 0.3s ease-in-out',
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
          borderRadius: '20px 20px 20px 5px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              backgroundColor: 'grey.400',
              borderRadius: '50%',
              animation: 'bounce 1.4s infinite ease-in-out',
              animationDelay: `${i * 0.16}s`,
              '@keyframes bounce': {
                '0%, 80%, 100%': {
                  transform: 'scale(0.6)',
                  opacity: 0.4,
                },
                '40%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Paper>
    </Box>
  );
};

export default TypingIndicator;
