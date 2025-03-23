import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Snackbar
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { updatePreferences, UserPreferences } from '../../services/profile';
import ExchangeRate from './ExchangeRate';

interface PreferencesFormProps {
  open: boolean;
  onClose: () => void;
}

// Common currency options
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' }
];

// Common timezone options
const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Asia/Kolkata', label: 'IST (India)' },
  { value: 'America/New_York', label: 'EST (New York)' },
  { value: 'America/Chicago', label: 'CST (Chicago)' },
  { value: 'America/Los_Angeles', label: 'PST (Los Angeles)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' },
  { value: 'Asia/Dubai', label: 'GST (Dubai)' },
  { value: 'Asia/Singapore', label: 'SGT (Singapore)' },
  { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
  { value: 'Asia/Shanghai', label: 'CST (Shanghai)' },
  { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
  { value: 'Pacific/Auckland', label: 'NZST (Auckland)' }
];

const PreferencesForm: React.FC<PreferencesFormProps> = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Initialize with default values - will be updated in useEffect
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency_preference: 'USD',
    timezone: 'UTC',
    notification_preferences: {
      email_notifications: true,
      expense_reminders: true,
      settlement_notifications: true,
      weekly_summary: false
    }
  });

  // Update preferences when dialog opens or user data changes
  useEffect(() => {
    if (open) {
      console.log("PreferencesForm opened with user data:", user);
      
      if (user) {
        // Create a fresh preferences object with current user data
        const updatedPreferences = {
          currency_preference: user.currency_preference || 'USD',
          timezone: user.timezone || 'UTC',
          notification_preferences: {
            // Use existing notification preferences or default values
            email_notifications: user.notification_preferences?.email_notifications ?? true,
            expense_reminders: user.notification_preferences?.expense_reminders ?? true,
            settlement_notifications: user.notification_preferences?.settlement_notifications ?? true,
            weekly_summary: user.notification_preferences?.weekly_summary ?? false
          }
        };
        
        setPreferences(updatedPreferences);
      }
      
      setError('');
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user: updatedUser } = await updatePreferences(preferences);
      updateUser(updatedUser);
      setShowSuccess(true);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleNotificationChange = (key: keyof UserPreferences['notification_preferences']) => {
    setPreferences(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: !prev.notification_preferences[key]
      }
    }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Preferences</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Currency Preference */}
              <FormControl fullWidth>
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  value={preferences.currency_preference}
                  label="Currency"
                  onChange={(e) => setPreferences({ ...preferences, currency_preference: e.target.value })}
                  disabled={isLoading}
                >
                  {CURRENCIES.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </MenuItem>
                  ))}
                </Select>
                <ExchangeRate currency={preferences.currency_preference} />
              </FormControl>

              {/* Timezone */}
              <FormControl fullWidth>
                <InputLabel id="timezone-label">Timezone</InputLabel>
                <Select
                  labelId="timezone-label"
                  value={preferences.timezone}
                  label="Timezone"
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  disabled={isLoading}
                >
                  {TIMEZONES.map((tz) => (
                    <MenuItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              {/* Notification Preferences */}
              <Typography variant="subtitle1" color="text.secondary">
                Notification Settings
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notification_preferences.email_notifications}
                      onChange={() => handleNotificationChange('email_notifications')}
                      disabled={isLoading}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notification_preferences.expense_reminders}
                      onChange={() => handleNotificationChange('expense_reminders')}
                      disabled={isLoading}
                    />
                  }
                  label="Expense Reminders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notification_preferences.settlement_notifications}
                      onChange={() => handleNotificationChange('settlement_notifications')}
                      disabled={isLoading}
                    />
                  }
                  label="Settlement Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notification_preferences.weekly_summary}
                      onChange={() => handleNotificationChange('weekly_summary')}
                      disabled={isLoading}
                    />
                  }
                  label="Weekly Summary"
                />
              </FormGroup>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              Save Preferences
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        message="Preferences updated successfully"
      />
    </>
  );
};

export default PreferencesForm;