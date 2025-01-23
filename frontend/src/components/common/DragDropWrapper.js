import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Box, List } from '@mui/material';

const DroppableComponent = ({ children, enabled }) => {
  if (!enabled) {
    return null;
  }

  return (
    <Droppable droppableId="prompts">
      {(provided) => (
        <List
          {...provided.droppableProps}
          ref={provided.innerRef}
          sx={{ 
            listStyle: 'none',
            p: 0,
            '& .MuiListItem-root': {
              display: 'flex',
              bgcolor: 'background.paper',
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }
          }}
        >
          {children}
          {provided.placeholder}
        </List>
      )}
    </Droppable>
  );
};

const DragDropWrapper = ({ onDragEnd, children }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Wait for a frame to enable dragging
    const animation = requestAnimationFrame(() => {
      setEnabled(true);
    });

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  return (
    <Box sx={{ minHeight: 100 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <DroppableComponent enabled={enabled}>
          {children}
        </DroppableComponent>
      </DragDropContext>
    </Box>
  );
};

export default DragDropWrapper; 