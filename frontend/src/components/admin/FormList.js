import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assessment as ResponsesIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { getForms, deleteForm } from '../../utils/api';
import AdminLayout from './AdminLayout';

const FormList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [forms, setForms] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await getForms();
      setForms(data);
    } catch (error) {
      console.error('Failed to load forms:', error);
    }
  };

  const handleDeleteClick = (form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteForm(formToDelete.formid);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
      loadForms();
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  const copyFormUrl = (formId) => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <AdminLayout title="Forms">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        mb: 3 
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/forms/new')}
          sx={{ 
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          Create Form
        </Button>
      </Box>

      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid item xs={12} sm={6} md={4} key={form.formid}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 1
                  }}
                >
                  {form.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {form.description || 'No description provided'}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center',
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem'
                }}>
                  <Box component="span">
                    {form.prompts?.length || 0} questions
                  </Box>
                  <Box 
                    component="span" 
                    sx={{ 
                      width: '4px', 
                      height: '4px', 
                      borderRadius: '50%', 
                      backgroundColor: 'currentColor' 
                    }} 
                  />
                  <Box component="span">
                    Created {new Date(form.created_at).toLocaleDateString()}
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions sx={{ 
                justifyContent: 'flex-end',
                gap: 1,
                p: 2,
                pt: 0
              }}>
                <Tooltip title="View Form">
                  <IconButton 
                    size="small"
                    onClick={() => window.open(`/forms/${form.formid}`, '_blank')}
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Responses">
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`/admin/forms/${form.formid}/responses`)}
                    sx={{ color: theme.palette.success.main }}
                  >
                    <ResponsesIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Form">
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`/admin/forms/${form.formid}/edit`)}
                    sx={{ color: theme.palette.info.main }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy Link">
                  <IconButton 
                    size="small"
                    onClick={() => copyFormUrl(form.formid)}
                    sx={{ color: theme.palette.secondary.main }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Form">
                  <IconButton 
                    size="small"
                    onClick={() => handleDeleteClick(form)}
                    sx={{ color: theme.palette.error.main }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{formToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default FormList;