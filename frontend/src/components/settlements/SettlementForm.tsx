import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Avatar, 
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Autocomplete
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon, EventNote as EventIcon } from '@mui/icons-material';
import { settlementService } from '../../services/settlement';
import { friendService, Friend } from '../../services/friend';
import { useAuth } from '../../contexts/AuthContext';

// Replace date-pickers imports with a simpler date input
interface User {
  id: string;
  name: string;
  email: string;
}

interface SettlementFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  friend?: User;
  groupId?: string;
  suggestedAmount?: number;
  isRecordingPayment?: boolean; // New prop to determine if recording payment (friend owes user)
}

const SettlementForm: React.FC<SettlementFormProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  friend, 
  groupId,
  suggestedAmount = 0,
  isRecordingPayment = false // Default is false (settling up = user pays)
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Set initial payer/receiver based on context
  const getInitialFormData = () => ({
    // If recording payment (friend owes user), friend should be payer
    // If settling up (user owes friend), user should be payer
    payer_id: isRecordingPayment ? (friend?.id || '') : (user?.id || ''),
    receiver_id: isRecordingPayment ? (user?.id || '') : (friend?.id || ''),
    amount: suggestedAmount > 0 ? suggestedAmount.toString() : '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [formData, setFormData] = useState(getInitialFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load friends list if no friend prop is provided
  useEffect(() => {
    if (!friend && open) {
      loadFriends();
    }
  }, [friend, open]);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      const friendsList = await friendService.getFriends();
      setFriends(friendsList);
    } catch (err) {
      console.error('Error loading friends:', err);
      setError('Failed to load friends list');
    } finally {
      setLoadingFriends(false);
    }
  };

  // Reset form data when props change
  useEffect(() => {
    setFormData(getInitialFormData());
    if (friend) {
      setSelectedFriend(friend);
    }
  }, [open, isRecordingPayment, friend?.id, user?.id, suggestedAmount]); 

  const handleFriendChange = (_: any, newValue: Friend | null) => {
    setSelectedFriend(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        receiver_id: newValue.id
      }));
    }
  };

  const validateAmount = (amount: string): boolean => {
    const value = parseFloat(amount);
    return !isNaN(value) && value > 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when amount is valid
      if (name === 'amount' && validateAmount(value as string)) {
        setError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!friend && !selectedFriend && !formData.receiver_id) {
      setError('Please select a friend');
      return;
    }

    // Validate amount before submission
    if (!validateAmount(formData.amount)) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setIsLoading(true);
    try {
      await settlementService.createSettlement({
        payer_id: formData.payer_id,
        receiver_id: formData.receiver_id,
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes || undefined,
        group_id: groupId
      });
      
      setShowSuccess(true);
      
      // Trigger success callback
      if (onSuccess) {
        await onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating settlement:', error);
      setError('Failed to create settlement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePayerReceiver = () => {
    setFormData(prev => ({
      ...prev,
      payer_id: prev.receiver_id,
      receiver_id: prev.payer_id
    }));
  };

  const otherPartyName = (friend || selectedFriend)?.name || 'other party';
  const hasSufficientData = formData.payer_id && formData.receiver_id && formData.amount && parseFloat(formData.amount) > 0;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <WalletIcon color="primary" />
          {isRecordingPayment ? 'Record a Payment' : 'Settle Up'}
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!friend && (
              <Autocomplete
                options={friends}
                loading={loadingFriends}
                value={selectedFriend}
                onChange={handleFriendChange}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Friend"
                    required
                    margin="normal"
                    error={!selectedFriend && !!error}
                    helperText={!selectedFriend && error ? 'Please select a friend' : ''}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingFriends ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}

            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 3,
                mt: 1,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {formData.payer_id === user?.id ? user?.name[0] : (friend || selectedFriend)?.name[0] || '?'}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {formData.payer_id === user?.id ? 'You' : otherPartyName}
                </Typography>
                <Typography variant="caption" color="text.secondary">Paying</Typography>
              </Box>

              {friend && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Button
                    size="small"
                    onClick={togglePayerReceiver}
                    sx={{
                      minWidth: 'unset',
                      mb: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    Swap
                  </Button>
                  <Typography variant="h6" fontWeight={500} color="primary.main">
                    ${formData.amount || '0.00'}
                  </Typography>
                </Box>
              )}

              {!friend && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={500} color="primary.main">
                    ${formData.amount || '0.00'}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {formData.receiver_id === user?.id ? user?.name[0] : (friend || selectedFriend)?.name[0] || '?'}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {formData.receiver_id === user?.id ? 'You' : otherPartyName}
                </Typography>
                <Typography variant="caption" color="text.secondary">Receiving</Typography>
              </Box>
            </Box>

            <TextField
              margin="dense"
              name="amount"
              label="Amount"
              type="number"
              fullWidth
              required
              value={formData.amount}
              onChange={handleChange}
              disabled={isLoading}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <TextField
              margin="dense"
              name="date"
              label="Date"
              type="date"
              fullWidth
              required
              value={formData.date}
              onChange={handleChange}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon color="action" />
                  </InputAdornment>
                )
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              margin="dense"
              name="notes"
              label="Notes (optional)"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Add any notes about this settlement"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isLoading} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !hasSufficientData}
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isLoading ? 'Recording...' : 'Record Settlement'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Settlement successfully recorded!
        </Alert>
      </Snackbar>
    </>
  );
};

export default SettlementForm;