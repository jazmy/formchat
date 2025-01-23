import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { getFormDetails, getFormResponses, deleteBulkResponses } from '../../utils/api';
import AdminLayout from './AdminLayout';

const FormResponses = () => {
  const { formId } = useParams();
  const theme = useTheme();
  const [form, setForm] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [expandedResponses, setExpandedResponses] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        setLoading(true);
        const data = await getFormResponses(formId);
        console.log('Loaded responses:', data);
        
        if (!data || !data.form || !data.prompts) {
          console.error('Invalid response data structure:', data);
          return;
        }
        
        setForm(data.form);
        
        // Get all prompts including output
        const allPrompts = [...data.prompts];
        if (data.form.output_prompt) {
          allPrompts.push({
            variable_name: 'output',
            question_text: 'Generated Output'
          });
        }
        setPrompts(allPrompts);
        
        // Filter out empty responses
        const validResponses = Array.isArray(data.responses) ? data.responses.filter(response => {
          return response.answers && response.answers.length > 0;
        }) : [];
        
        console.log('Processed responses:', validResponses);
        setResponses(validResponses);
      } catch (error) {
        console.error('Failed to load responses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResponses();
  }, [formId]);

  const handleExportCSV = async () => {
    try {
      const responsesToExport = selectedResponses.length > 0
        ? responses.filter(r => selectedResponses.includes(r.responseid))
        : responses;

      // Create CSV data
      const csvData = [];
      
      // Add headers
      const headers = ['submission_date'];
      prompts.forEach(prompt => headers.push(prompt.variable_name));
      csvData.push(headers);
      
      // Add rows
      responsesToExport.forEach(response => {
        const row = [new Date(response.created_at).toLocaleString()];
        prompts.forEach(prompt => {
          const answer = response.answers.find(a => a.variable_name === prompt.variable_name);
          row.push(answer?.response_text || '');
        });
        csvData.push(row);
      });

      // Convert to CSV string
      const csvString = csvData.map(row => 
        row.map(cell => {
          if (cell === null || cell === undefined) return '';
          const cellStr = String(cell);
          return cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')
            ? `"${cellStr.replace(/"/g, '""')}"` 
            : cellStr;
        }).join(',')
      ).join('\n');

      // Download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `form_responses_${formId}_${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const toggleResponseExpansion = (responseId) => {
    setExpandedResponses(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(responseId)) {
        newExpanded.delete(responseId);
      } else {
        newExpanded.add(responseId);
      }
      return newExpanded;
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedResponses(responses.map(r => r.responseid));
    } else {
      setSelectedResponses([]);
    }
  };

  const handleSelectResponse = (responseId) => {
    setSelectedResponses(prev => {
      if (prev.includes(responseId)) {
        return prev.filter(id => id !== responseId);
      } else {
        return [...prev, responseId];
      }
    });
  };

  const handleDeleteSelected = async (responseIds) => {
    try {
      await deleteBulkResponses(formId, responseIds);
      setSelectedResponses([]);
      setDeleteDialogOpen(false);
      const data = await getFormResponses(formId);
      setResponses(data.responses);
    } catch (error) {
      console.error('Failed to delete responses:', error);
    }
  };

  if (loading || !form) {
    return (
      <AdminLayout title="Loading Responses...">
        <Typography>Loading...</Typography>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${form.title} - Responses`} showBack>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          disabled={responses.length === 0}
          sx={{ 
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          Export {selectedResponses.length > 0 ? `Selected (${selectedResponses.length})` : 'All'}
        </Button>
        {selectedResponses.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ 
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            Delete Selected ({selectedResponses.length})
          </Button>
        )}
      </Box>

      {responses.length === 0 ? (
        <Card>
          <CardContent>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ textAlign: 'center', py: 4 }}
            >
              No responses yet
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedResponses.length === responses.length}
                    indeterminate={selectedResponses.length > 0 && selectedResponses.length < responses.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Submission Date</TableCell>
                {prompts.map((prompt) => (
                  <TableCell 
                    key={prompt.variable_name}
                    title={prompt.question_text}
                    sx={{ minWidth: 150 }}
                  >
                    {prompt.variable_name}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responses.map((response) => {
                const isSelected = selectedResponses.includes(response.responseid);

                return (
                  <TableRow
                    key={response.responseid}
                    hover
                    selected={isSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectResponse(response.responseid)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(response.created_at).toLocaleString()}
                    </TableCell>
                    {prompts.map((prompt) => {
                      const answer = response.answers.find(a => a.variable_name === prompt.variable_name);
                      const text = answer?.response_text || '';
                      
                      return (
                        <TableCell 
                          key={prompt.variable_name}
                          sx={{ 
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {text ? (
                            text.length > 100 ? (
                              <Tooltip title={text} placement="top">
                                <Typography>
                                  {text.substring(0, 100) + '...'}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography>
                                {text}
                              </Typography>
                            )
                          ) : (
                            <Typography color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteSelected([response.responseid])}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedResponses.length} selected responses? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleDeleteSelected(selectedResponses)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default FormResponses;