import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Draggable } from 'react-beautiful-dnd';
import { createForm, getFormDetails, updateForm } from '../../utils/api';
import AdminLayout from './AdminLayout';
import DragDropWrapper from '../common/DragDropWrapper';

const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    starter_prompt: '',
    output_prompt: '',
    prompts: []
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState({
    variable_name: '',
    question_text: ''
  });
  const [editIndex, setEditIndex] = useState(-1);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    try {
      const data = await getFormDetails(formId);
      setForm(data);
    } catch (error) {
      console.error('Failed to load form:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!form.title.trim()) {
        console.error('Title is required');
        return;
      }

      // Prepare prompts with all required fields
      const promptsWithFields = form.prompts.map((prompt, index) => ({
        question_text: prompt.question_text,
        variable_name: prompt.variable_name,
        validation_criteria: prompt.validation_criteria || '',
        order: index
      }));

      const formData = {
        title: form.title,
        description: form.description || '',
        starter_prompt: form.starter_prompt || '',
        output_prompt: form.output_prompt || '',
        prompts: promptsWithFields
      };

      console.log('Saving form data:', formData);

      if (formId) {
        const savedForm = await updateForm(formId, formData);
        console.log('Form saved successfully:', savedForm);
        navigate('/admin');
      } else {
        const result = await createForm(formData);
        console.log('Created form with ID:', result);
        navigate('/admin');
      }
    } catch (error) {
      console.error('Save error:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handlePromptSave = () => {
    const newPrompts = [...form.prompts];
    if (editIndex >= 0) {
      newPrompts[editIndex] = {
        ...currentPrompt,
        validation_criteria: currentPrompt.validation_criteria || null
      };
    } else {
      newPrompts.push({
        ...currentPrompt,
        validation_criteria: currentPrompt.validation_criteria || null
      });
    }
    setForm(prev => ({
      ...prev,
      prompts: newPrompts
    }));
    handleDialogClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentPrompt({ variable_name: '', question_text: '' });
    setEditIndex(-1);
  };

  const handlePromptEdit = (index) => {
    setCurrentPrompt(form.prompts[index]);
    setEditIndex(index);
    setDialogOpen(true);
  };

  const handlePromptDelete = (index) => {
    const newPrompts = form.prompts.filter((_, i) => i !== index);
    setForm({ ...form, prompts: newPrompts });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(form.prompts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property for each prompt
    const updatedPrompts = items.map((prompt, index) => ({
      ...prompt,
      order: index
    }));

    setForm(prev => ({ ...prev, prompts: updatedPrompts }));
  };

  return (
    <AdminLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {formId ? 'Edit Form' : 'Create New Form'}
        </Typography>

        <TextField
          fullWidth
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          margin="normal"
          multiline
          rows={2}
        />

        <TextField
          fullWidth
          label="Starter Prompt"
          value={form.starter_prompt}
          onChange={(e) => setForm({ ...form, starter_prompt: e.target.value })}
          margin="normal"
          multiline
          rows={4}
          helperText="This prompt will guide OpenAI's behavior and persona. It will not be shown to users."
        />

        <TextField
          fullWidth
          label="Output Prompt"
          value={form.output_prompt}
          onChange={(e) => setForm({ ...form, output_prompt: e.target.value })}
          margin="normal"
          multiline
          rows={4}
          helperText="Optional: Provide instructions for generating a final output/report after form completion. Leave empty for no output."
        />

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Questions</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                setCurrentPrompt({
                  variable_name: '',
                  question_text: '',
                  validation_criteria: ''
                });
                setEditIndex(-1);
                setDialogOpen(true);
              }}
              sx={{ ml: 2 }}
            >
              Add Question
            </Button>
          </Box>

          <DragDropWrapper onDragEnd={onDragEnd}>
            {form.prompts.map((prompt, index) => (
              <Draggable key={index} draggableId={`prompt-${index}`} index={index}>
                {(provided) => (
                  <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{
                      bgcolor: 'background.paper',
                      mb: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <div {...provided.dragHandleProps}>
                      <DragHandleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    </div>
                    <ListItemText
                      primary={`Question ${index + 1}: ${prompt.question_text}`}
                      secondary={`Variable: ${prompt.variable_name}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => {
                          setCurrentPrompt(prompt);
                          setEditIndex(index);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handlePromptDelete(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )}
              </Draggable>
            ))}
          </DragDropWrapper>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!form.title || form.prompts.length === 0}
          >
            {formId ? 'Save Changes' : 'Create Form'}
          </Button>
          <Button onClick={() => navigate('/admin')} color="inherit">
            Cancel
          </Button>
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editIndex === -1 ? 'Add New Question' : 'Edit Question'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Question Text"
              value={currentPrompt.question_text}
              onChange={(e) =>
                setCurrentPrompt({
                  ...currentPrompt,
                  question_text: e.target.value,
                })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Variable Name"
              value={currentPrompt.variable_name}
              onChange={(e) =>
                setCurrentPrompt({
                  ...currentPrompt,
                  variable_name: e.target.value,
                })
              }
              margin="normal"
              required
              helperText="A unique identifier for this question (e.g., 'name', 'email', 'feedback')"
            />
            <TextField
              fullWidth
              label="Validation Criteria"
              value={currentPrompt.validation_criteria}
              onChange={(e) =>
                setCurrentPrompt({
                  ...currentPrompt,
                  validation_criteria: e.target.value,
                })
              }
              margin="normal"
              multiline
              rows={3}
              helperText="Specify criteria for what makes a valid answer (optional)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePromptSave} variant="contained">
              {editIndex === -1 ? 'Add Question' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default FormBuilder;