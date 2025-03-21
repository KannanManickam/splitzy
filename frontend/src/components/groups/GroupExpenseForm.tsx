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
  SelectChangeEvent,
  FormHelperText,
  Tooltip,
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

interface FormErrors {
  description?: string;
  amount?: string;
  date?: string;
  paidBy?: string;
  splitBetween?: string;
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

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData && open) {
      setFormData(initialData);
      setFormErrors({});
      setTouched({});
    } else if (!initialData && open) {
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidBy: user?.id || '',
        split_between: [],
      });
      setFormErrors({});
      setTouched({});
    }
  }, [initialData, open, user]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'description':
        return !value.trim() ? 'Description is required' : '';
      case 'amount':
        if (!value) return 'Amount is required';
        if (isNaN(value) || Number(value) <= 0) return 'Amount must be greater than 0';
        return '';
      case 'paidBy':
        return !value ? 'Payer is required' : '';
      case 'split_between':
        return (!value || value.length === 0) ? 'Select at least one member' : '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof GroupExpenseFormData]);
      if (error) {
        errors[key as keyof FormErrors] = error;
        isValid = false;
      }
    });

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
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, formData[fieldName as keyof GroupExpenseFormData]);
    setFormErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date.format('YYYY-MM-DD'),
      }));
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string | string[]>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'split_between' ? (typeof value === 'string' ? value.split(',') : value) : value,
    }));
    
    // Clear error when user makes a selection
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  // Calculate per person amount for the split preview
  const perPersonAmount = formData.amount && formData.split_between.length > 0
    ? (Number(formData.amount) / formData.split_between.length).toFixed(2)
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
              onBlur={() => handleBlur('description')}
              error={touched.description && !!formErrors.description}
              helperText={touched.description && formErrors.description}
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
              onBlur={() => handleBlur('amount')}
              error={touched.amount && !!formErrors.amount}
              helperText={touched.amount && formErrors.amount}
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
                value={dayjs(formData.date)}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    error: touched.date && !!formErrors.date,
                    helperText: touched.date && formErrors.date,
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
              error={touched.paidBy && !!formErrors.paidBy}
            >
              <InputLabel>Paid By</InputLabel>
              <Select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleSelectChange}
                onBlur={() => handleBlur('paidBy')}
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
              {touched.paidBy && formErrors.paidBy && (
                <FormHelperText>{formErrors.paidBy}</FormHelperText>
              )}
            </FormControl>

            <FormControl 
              fullWidth 
              required
              error={touched.split_between && !!formErrors.splitBetween}
            >
              <InputLabel>Split Between</InputLabel>
              <Select
                multiple
                name="split_between"
                value={formData.split_between}
                onChange={handleSelectChange}
                onBlur={() => handleBlur('split_between')}
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
                    />
                  </MenuItem>
                ))}
              </Select>
              {touched.split_between && formErrors.splitBetween && (
                <FormHelperText>{formErrors.splitBetween}</FormHelperText>
              )}
            </FormControl>

            {/* Split Preview */}
            {formData.amount && formData.split_between.length > 0 && (
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
            disabled={
              !formData.description || 
              !formData.amount || 
              formData.split_between.length === 0 ||
              Object.keys(formErrors).some(key => !!formErrors[key as keyof FormErrors])
            }
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