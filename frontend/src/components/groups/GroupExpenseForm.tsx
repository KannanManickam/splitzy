import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  InputAdornment,
  useTheme,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  ListItemAvatar,
  Checkbox,
  SelectChangeEvent
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
import { useAuth } from '../../contexts/AuthContext';

interface GroupMember {
  id: string;
  name: string;
  email: string;
}

interface GroupExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (expense: GroupExpenseFormData) => void;
  groupMembers: GroupMember[];
  initialData?: GroupExpenseFormData;
  isEditing?: boolean;
}

export interface GroupExpenseFormData {
  description: string;
  amount: string;
  date: string;
  paidBy: string;
  split_between: string[];
}

const GroupExpenseForm: React.FC<GroupExpenseFormProps> = ({
  open,
  onClose,
  onSubmit,
  groupMembers,
  initialData,
  isEditing = false,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<GroupExpenseFormData>(
    initialData || {
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paidBy: user?.id || '',
      split_between: [],
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
        split_between: [],
      });
    }
  }, [initialData, open, user]);

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

  const handleSelectChange = (event: SelectChangeEvent<string | string[]>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'split_between' ? (typeof value === 'string' ? value.split(',') : value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

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
          {isEditing ? 'Edit Group Expense' : 'Add Group Expense'}
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
                {groupMembers.map((member) => (
                  <MenuItem 
                    key={member.id} 
                    value={member.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'primary.lighter'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        width: 28, 
                        height: 28,
                        bgcolor: member.id === user?.id ? 'primary.main' : 'secondary.main',
                        fontSize: '0.875rem'
                      }}>
                        {member.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                          {member.name}
                          {member.id === user?.id && 
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
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Split Between</InputLabel>
              <Select
                multiple
                name="split_between"
                value={formData.split_between}
                onChange={handleSelectChange}
                label="Split Between"
                renderValue={(selected) => `${selected.length} members selected`}
                startAdornment={
                  <InputAdornment position="start">
                    <GroupIcon sx={{ color: 'info.main', ml: 2 }} />
                  </InputAdornment>
                }
              >
                {groupMembers.map((member) => (
                  <MenuItem 
                    key={member.id} 
                    value={member.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'info.lighter'
                      }
                    }}
                  >
                    <Checkbox 
                      checked={formData.split_between.indexOf(member.id) > -1}
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
                        bgcolor: member.id === user?.id ? 'primary.main' : 'secondary.main',
                        fontSize: '0.875rem'
                      }}>
                        {member.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                          {member.name}
                          {member.id === user?.id && 
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
                      secondary={member.email} 
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
            disabled={!formData.description || !formData.amount || formData.split_between.length === 0}
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

export default GroupExpenseForm;