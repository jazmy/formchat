import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import AdminLayout from './AdminLayout';
import { getSettings, updateSettings, updatePassword } from '../../utils/api';

const SettingSection = ({ title, children }) => (
  <Paper sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}>
      {title}
    </Typography>
    <Stack spacing={2}>
      {children}
    </Stack>
  </Paper>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    OPENAI_API_KEY: '',
    MODELS: {
      CHAT: '',
      WELCOME: '',
      VALIDATION: ''
    },
    CHAT_PROCESSING: {
      MAX_TOKENS: {
        CONVERSATIONAL: 1000,
        WELCOME: 100,
        VALIDATION: 1000,
        GUIDANCE: 1000
      },
      TEMPERATURE: {
        CONVERSATIONAL: 0.7,
        WELCOME: 0.7,
        VALIDATION: 0.3,
        GUIDANCE: 0.7
      }
    },
    RATE_LIMIT: {
      TOKENS_PER_MIN: 90000,
      MAX_REQUESTS_PER_MIN: 3500
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setSettings(prevSettings => ({
        ...prevSettings,
        ...data
      }));
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateSettings(settings);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPasswordError(null);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError(null);
    setPasswordSuccess(false);
  };

  const handlePasswordSubmit = async () => {
    try {
      // Validate passwords
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setPasswordError('All fields are required');
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long');
        return;
      }

      setChangingPassword(true);
      setPasswordError(null);

      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setPasswordSuccess(true);
      setTimeout(() => {
        handlePasswordDialogClose();
      }, 2000);
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <SettingSection title="Security">
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={() => setPasswordDialogOpen(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Change Admin Password
          </Button>
        </SettingSection>

        <SettingSection title="API Settings">
          <TextField
            fullWidth
            label="OpenAI API Key"
            value={settings.OPENAI_API_KEY || ''}
            onChange={(e) => handleSettingChange('OPENAI_API_KEY', e.target.value)}
            type="password"
            placeholder="Enter your OpenAI API key"
          />
        </SettingSection>

        <SettingSection title="Model Settings">
          <TextField
            fullWidth
            label="Chat Model"
            value={settings.MODELS?.CHAT || ''}
            onChange={(e) => handleSettingChange('MODELS', { ...settings.MODELS, CHAT: e.target.value })}
            placeholder="e.g., gpt-4"
          />
          <TextField
            fullWidth
            label="Welcome Model"
            value={settings.MODELS?.WELCOME || ''}
            onChange={(e) => handleSettingChange('MODELS', { ...settings.MODELS, WELCOME: e.target.value })}
            placeholder="e.g., gpt-4"
          />
          <TextField
            fullWidth
            label="Validation Model"
            value={settings.MODELS?.VALIDATION || ''}
            onChange={(e) => handleSettingChange('MODELS', { ...settings.MODELS, VALIDATION: e.target.value })}
            placeholder="e.g., gpt-4"
          />
        </SettingSection>

        <SettingSection title="Chat Processing Settings">
          <TextField
            fullWidth
            label="Conversational Max Tokens"
            value={settings.CHAT_PROCESSING?.MAX_TOKENS?.CONVERSATIONAL || ''}
            onChange={(e) => handleSettingChange('CHAT_PROCESSING', { ...settings.CHAT_PROCESSING, MAX_TOKENS: { ...settings.CHAT_PROCESSING.MAX_TOKENS, CONVERSATIONAL: e.target.value } })}
            placeholder="e.g., 1000"
          />
          <TextField
            fullWidth
            label="Welcome Max Tokens"
            value={settings.CHAT_PROCESSING?.MAX_TOKENS?.WELCOME || ''}
            onChange={(e) => handleSettingChange('CHAT_PROCESSING', { ...settings.CHAT_PROCESSING, MAX_TOKENS: { ...settings.CHAT_PROCESSING.MAX_TOKENS, WELCOME: e.target.value } })}
            placeholder="e.g., 100"
          />
          <TextField
            fullWidth
            label="Validation Max Tokens"
            value={settings.CHAT_PROCESSING?.MAX_TOKENS?.VALIDATION || ''}
            onChange={(e) => handleSettingChange('CHAT_PROCESSING', { ...settings.CHAT_PROCESSING, MAX_TOKENS: { ...settings.CHAT_PROCESSING.MAX_TOKENS, VALIDATION: e.target.value } })}
            placeholder="e.g., 1000"
          />
          <TextField
            fullWidth
            label="Guidance Max Tokens"
            value={settings.CHAT_PROCESSING?.MAX_TOKENS?.GUIDANCE || ''}
            onChange={(e) => handleSettingChange('CHAT_PROCESSING', { ...settings.CHAT_PROCESSING, MAX_TOKENS: { ...settings.CHAT_PROCESSING.MAX_TOKENS, GUIDANCE: e.target.value } })}
            placeholder="e.g., 1000"
          />
          <TextField
            fullWidth
            label="Conversational Temperature"
            value={settings.CHAT_PROCESSING?.TEMPERATURE?.CONVERSATIONAL || ''}
            onChange={(e) => handleSettingChange('CHAT_PROCESSING', { ...settings.CHAT_PROCESSING, TEMPERATURE: { ...settings.CHAT_PROCESSING.TEMPERATURE, CONVERSATIONAL: e.target.value } })}
            placeholder="e.g., 0.7"
          />
          <TextField
            fullWidth
            label="Welcome Temperature"
            value={settings.CHAT_PROCESSING?.TEMPERATURE?.WELCOME || ''}
            onChange={(e) => handleSettingChange('CHAT_PROCESSING', { ...settings.CHAT_PROCESSING, TEMPERATURE: { ...settings.CHAT_PROCESSING.TEMPERATURE, WELCOME: e.target.value } })}
            placeholder="e.g., 0.7"
          />
          <TextField
            fullWidth
            label="Validation Temperature"
            value={settings.CHAT_PROCESSING?.TEMPERATURE?.VALIDATION || ''}
            onChange={(e) => handleSettingChange('CHAT_PROCESSING', { ...settings.CHAT_PROCESSING, TEMPERATURE: { ...settings.CHAT_PROCESSING.TEMPERATURE, VALIDATION: e.target.value } })}
            placeholder="e.g., 0.3"
          />
          <TextField
            fullWidth
            label="Guidance Temperature"
            value={settings.CHAT_PROCESSING?.TEMPERATURE?.GUIDANCE || ''}
            onChange={(e) => handleSettingChange('CHAT_PROCESSING', { ...settings.CHAT_PROCESSING, TEMPERATURE: { ...settings.CHAT_PROCESSING.TEMPERATURE, GUIDANCE: e.target.value } })}
            placeholder="e.g., 0.7"
          />
        </SettingSection>

        <SettingSection title="Rate Limit Settings">
          <TextField
            fullWidth
            label="Tokens Per Minute"
            value={settings.RATE_LIMIT?.TOKENS_PER_MIN || ''}
            onChange={(e) => handleSettingChange('RATE_LIMIT', { ...settings.RATE_LIMIT, TOKENS_PER_MIN: e.target.value })}
            placeholder="e.g., 90000"
          />
          <TextField
            fullWidth
            label="Max Requests Per Minute"
            value={settings.RATE_LIMIT?.MAX_REQUESTS_PER_MIN || ''}
            onChange={(e) => handleSettingChange('RATE_LIMIT', { ...settings.RATE_LIMIT, MAX_REQUESTS_PER_MIN: e.target.value })}
            placeholder="e.g., 3500"
          />
        </SettingSection>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ minWidth: 120 }}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={saving}
            startIcon={<RefreshIcon />}
          >
            Reset
          </Button>
        </Box>

        <Dialog 
          open={passwordDialogOpen} 
          onClose={handlePasswordDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Change Admin Password</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Password updated successfully!
                </Alert>
              )}
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
                disabled={changingPassword || passwordSuccess}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={passwordForm.newPassword}
                onChange={handlePasswordChange('newPassword')}
                disabled={changingPassword || passwordSuccess}
                helperText="Must be at least 8 characters long"
              />
              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                disabled={changingPassword || passwordSuccess}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handlePasswordDialogClose}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordSubmit}
              variant="contained"
              disabled={changingPassword || passwordSuccess}
            >
              {changingPassword ? <CircularProgress size={24} /> : 'Update Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminSettings;
