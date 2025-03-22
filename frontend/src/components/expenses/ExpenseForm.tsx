import React, { useState, useEffect } from 'react';
import { friendService } from '../../services/friend';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemAvatar,
  ListItemText,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  SelectChangeEvent,
  Typography,
  IconButton,
  Stack,
  InputAdornment,
  useTheme,
  Divider,
  CircularProgress,
  Tooltip,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface Friend {
  id: string;
  name: string;
  email: string;
}

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (expense: ExpenseFormData) => void;
  initialData?: ExpenseFormData;
  isEditing?: boolean;
}

export interface ExpenseFormData {
  description: string;
  amount: string;
  date: string;
  paidBy: string;
  splitBetween: string[];
}

interface FormErrors {
  description?: string;
  amount?: string;
  date?: string;
  paidBy?: string;
  splitBetween?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);  // This is for form submit loading
  const [loadingFriends, setLoadingFriends] = useState(true);  // This is for initial friends loading
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<ExpenseFormData>(
    initialData || {
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidBy: user?.id || '',
      splitBetween: [],
    }
  );

  useEffect(() => {
    if (initialData && open) {
      setFormData(initialData);
    } else if (!initialData && open) {
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidBy: user?.id || '',
        splitBetween: [],
      });
    }
  }, [initialData, open, user]);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const friendsList = await friendService.getFriends();
      setFriends(friendsList);
      setLoadingFriends(false);
    } catch (error) {
      console.error('Error loading friends:', error);
      setLoadingFriends(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
      isValid = false;
    }

    if (!formData.date) {
      errors.date = 'Date is required';
      isValid = false;
    }

    if (!formData.paidBy) {
      errors.paidBy = 'Please select who paid';
      isValid = false;
    }

    if (formData.splitBetween.length === 0) {
      errors.splitBetween = 'Please select at least one person to split with';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date.format('YYYY-MM-DD'),
      }));
      // Clear date error
      if (formErrors.date) {
        setFormErrors(prev => ({
          ...prev,
          date: undefined
        }));
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user makes a selection
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
      // Only close the form after successful submission
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
      // Keep the form open if there's an error
    } finally {
      setLoading(false);
    }
  };

  const allParticipants = React.useMemo(() => {
    if (!user) return friends;
    return [
      {
        id: user.id,
        name: user.name,
        email: user.email
      },
      ...friends
    ];
  }, [friends, user]);

  const parsedDate = formData.date ? dayjs(formData.date) : dayjs();

  if (loadingFriends) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading friends...</Typography>
        </Box>
      </Dialog>
    );
  }

  const perPersonAmount = formData.amount && formData.splitBetween.length > 0
    ? (parseFloat(formData.amount) / formData.splitBetween.length).toFixed(2)
    : '0.00';

  return (
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
          {isEditing ? 'Edit Expense' : 'Add New Expense'}
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
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              required
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              required
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              error={!!formErrors.amount}
              helperText={formErrors.amount}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MonetizationOnIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={parsedDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    error: !!formErrors.date,
                    helperText: formErrors.date,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }
                  }
                }}
              />
            </LocalizationProvider>
            
            <FormControl 
              fullWidth 
              required
              error={!!formErrors.paidBy}
            >
              <InputLabel>Paid By</InputLabel>
              <Select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleSelectChange}
                label="Paid By"
                startAdornment={
                  <InputAdornment position="start">
                    <AccountBalanceWalletIcon sx={{ color: 'success.main', ml: 2 }} />
                  </InputAdornment>
                }
              >
                {allParticipants.map((participant) => (
                  <MenuItem 
                    key={participant.id} 
                    value={participant.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'primary.lighter'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28,
                          mr: 1,
                          bgcolor: participant.id === user?.id ? 'primary.main' : 'secondary.main',
                          fontSize: '0.875rem'
                        }}
                      >
                        {participant.name[0]}
                      </Avatar>
                      <Box>
                        {participant.name}
                        {participant.id === user?.id && 
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              ml: 1, 
                              color: 'text.secondary',
                              bgcolor: 'primary.lighter',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1
                            }}
                          >
                            You
                          </Typography>
                        }
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.paidBy && (
                <FormHelperText>{formErrors.paidBy}</FormHelperText>
              )}
            </FormControl>
            
            <FormControl 
              fullWidth 
              required
              error={!!formErrors.splitBetween}
            >
              <InputLabel>Split Between</InputLabel>
              <Select
                multiple
                name="splitBetween"
                value={formData.splitBetween}
                onChange={handleSelectChange}
                label="Split Between"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => {
                      const participant = allParticipants.find(p => p.id === value);
                      return participant ? (
                        <Chip 
                          key={value} 
                          label={`${participant.name}${participant.id === user?.id ? ' (You)' : ''}`}
                          size="small"
                          avatar={
                            <Avatar sx={{ 
                              bgcolor: participant.id === user?.id ? 'primary.main' : 'secondary.main' 
                            }}>
                              {participant.name[0]}
                            </Avatar>
                          }
                          sx={{
                            bgcolor: 'info.lighter',
                            color: 'info.main',
                            '& .MuiChip-deleteIcon': {
                              color: 'info.main',
                              '&:hover': {
                                color: 'error.main'
                              }
                            }
                          }}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
                startAdornment={
                  <InputAdornment position="start">
                    <GroupIcon sx={{ color: 'info.main', ml: 2 }} />
                  </InputAdornment>
                }
              >
                {allParticipants.map((participant) => (
                  <MenuItem 
                    key={participant.id} 
                    value={participant.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'info.lighter'
                      }
                    }}
                  >
                    <Checkbox 
                      checked={formData.splitBetween.indexOf(participant.id) > -1}
                      sx={{
                        color: 'info.main',
                        '&.Mui-checked': {
                          color: 'info.main',
                        },
                      }}
                    />
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        width: 28, 
                        height: 28,
                        bgcolor: participant.id === user?.id ? 'primary.main' : 'secondary.main',
                        fontSize: '0.875rem'
                      }}>
                        {participant.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                          {participant.name}
                          {participant.id === user?.id && 
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                ml: 1, 
                                color: 'text.secondary',
                                bgcolor: 'primary.lighter',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1
                              }}
                            >
                              You
                            </Typography>
                          }
                        </Box>
                      }
                      secondary={participant.email} 
                      secondaryTypographyProps={{
                        sx: { fontSize: '0.75rem' }
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
              {formErrors.splitBetween && (
                <FormHelperText>{formErrors.splitBetween}</FormHelperText>
              )}
            </FormControl>

            {/* Split Preview */}
            {formData.amount && formData.splitBetween.length > 0 && (
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  bgcolor: 'info.lighter',
                  borderRadius: 2
                }}
              >
                <HelpOutlineIcon color="info" />
                <Typography variant="body2" color="info.main">
                  Each person will pay: <strong>${perPersonAmount}</strong>
                </Typography>
                <Tooltip title="The total amount will be split equally between all selected participants">
                  <IconButton size="small" color="info">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
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
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            sx={{
              position: 'relative',
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress 
                  size={24} 
                  sx={{ 
                    position: 'absolute',
                    left: 24,
                    color: 'primary.light' 
                  }} 
                />
                {isEditing ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Expense'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseForm;