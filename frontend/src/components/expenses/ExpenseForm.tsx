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
  OutlinedInput,
  Avatar,
  SelectChangeEvent,
  Typography,
  IconButton,
  Stack,
  InputAdornment,
  useTheme,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';

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
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<ExpenseFormData>(
    initialData || {
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidBy: user?.id || '',
      splitBetween: [],
    }
  );

  // Add this effect to update form data when initialData changes
  useEffect(() => {
    if (initialData && open) {
      setFormData(initialData);
    } else if (!initialData && open) {
      // Reset form when opening without initial data
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
      setLoading(false);
    } catch (error) {
      console.error('Error loading friends:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: date.format('YYYY-MM-DD'),
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
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

  // Parse date string to dayjs object for DatePicker
  const parsedDate = formData.date ? dayjs(formData.date) : dayjs();

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
            
            <FormControl fullWidth required>
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
            </FormControl>
            
            <FormControl fullWidth required>
              <InputLabel>Split Between</InputLabel>
              <Select
                multiple
                name="splitBetween"
                value={formData.splitBetween}
                onChange={handleSelectChange}
                input={<OutlinedInput label="Split Between" />}
                startAdornment={
                  <InputAdornment position="start">
                    <GroupIcon sx={{ color: 'info.main', ml: 2 }} />
                  </InputAdornment>
                }
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
            </FormControl>
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
            disabled={loading || !formData.paidBy || formData.splitBetween.length === 0}
            sx={{
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {isEditing ? 'Save Changes' : 'Add Expense'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseForm;