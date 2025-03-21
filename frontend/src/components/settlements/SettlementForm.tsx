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
  Autocomplete,
  Stack,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon,
  Event as EventIcon,
  Close as CloseIcon,
  CompareArrows as SwapIcon
} from '@mui/icons-material';
import { settlementService } from '../../services/settlement';
import { friendService, Friend } from '../../services/friend';
import { useAuth } from '../../contexts/AuthContext';

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
  isRecordingPayment?: boolean;
}

interface FormData {
  payer_id: string;
  receiver_id: string;
  amount: string;
  date: string;
  notes: string;
}

const SettlementForm: React.FC<SettlementFormProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  friend, 
  groupId,
  suggestedAmount = 0,
  isRecordingPayment = false
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const getInitialFormData = () => ({
    payer_id: isRecordingPayment ? (friend?.id || '') : (user?.id || ''),
    receiver_id: isRecordingPayment ? (user?.id || '') : (friend?.id || ''),
    amount: suggestedAmount > 0 ? suggestedAmount.toString() : '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!friend && open) {
      loadFriends();
    }
  }, [friend, open]);

  useEffect(() => {
    setFormData(getInitialFormData());
    if (friend) {
      setSelectedFriend(friend);
    }
  }, [open, isRecordingPayment, friend?.id, user?.id, suggestedAmount]);

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

  const handleFriendChange = (_: any, newValue: Friend | null) => {
    setSelectedFriend(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        payer_id: isRecordingPayment ? newValue.id : user?.id || '',
        receiver_id: isRecordingPayment ? user?.id || '' : newValue.id
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.payer_id || !formData.receiver_id || !formData.amount) {
      setError('Please fill in all required fields');
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
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}>
            {isRecordingPayment ? 'Record a Payment' : 'Settle Up'}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { 
                bgcolor: 'error.lighter',
                color: 'error.main'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
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
                      error={!selectedFriend && !!error}
                      helperText={!selectedFriend && error ? 'Please select a friend' : ''}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <WalletIcon sx={{ color: 'primary.main', ml: 1 }} />
                          </InputAdornment>
                        ),
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
                  <IconButton
                    onClick={togglePayerReceiver}
                    sx={{
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'primary.lighter'
                      }
                    }}
                  >
                    <SwapIcon />
                  </IconButton>
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
                required
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography color="primary.main">$</Typography>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                required
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  )
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="Notes (optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Add any notes about this settlement"
              />
            </Stack>
          </form>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'error.lighter',
                borderColor: 'error.light'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !hasSufficientData}
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {isLoading ? 'Recording...' : 'Record Settlement'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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