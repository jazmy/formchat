import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Link as MuiLink
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getForms, deleteForm } from '../../utils/api';
import AdminLayout from './AdminLayout';
import { Link as RouterLink } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState(null);

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

  const copyFormUrl = (formId) => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setSnackbarOpen(true);
  };

  const handleDeleteClick = (form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      await deleteForm(formToDelete.formid);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
      await loadForms();
    } catch (error) {
      console.error('Failed to delete form:', error);
      setError(error.response?.data?.error || 'Failed to delete form');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  return (
    <AdminLayout>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h4" component="h1">
            Forms
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/forms/new')}
            size="large"
          >
            Create New Form
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center" sx={{ minWidth: 100 }}>Questions</TableCell>
                <TableCell align="center" sx={{ minWidth: 100 }}>Responses</TableCell>
                <TableCell align="right" sx={{ minWidth: 140 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.formid} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{form.title}</TableCell>
                  <TableCell>{form.description}</TableCell>
                  <TableCell align="center">{form.questionCount || 0}</TableCell>
                  <TableCell align="center">
                    <MuiLink
                      component={RouterLink}
                      to={`/admin/forms/${form.formid}/responses`}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        fontWeight: 500,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {form.responseCount || 0}
                      <ViewIcon sx={{ ml: 0.5, fontSize: '0.9em' }} />
                    </MuiLink>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      gap: 1
                    }}>
                      <Tooltip title="Copy form URL">
                        <IconButton
                          onClick={() => copyFormUrl(form.formid)}
                          size="small"
                          sx={{ bgcolor: 'grey.100' }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit form">
                        <IconButton
                          onClick={() => navigate(`/admin/forms/${form.formid}`)}
                          size="small"
                          sx={{ bgcolor: 'grey.100' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete form">
                        <IconButton
                          onClick={() => handleDeleteClick(form)}
                          size="small"
                          color="error"
                          sx={{ bgcolor: 'error.lighter' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{formToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
          {error && (
            <DialogContentText color="error" sx={{ mt: 2 }}>
              Error: {error}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Form URL copied to clipboard"
      />
    </AdminLayout>
  );
};

export default AdminDashboard;