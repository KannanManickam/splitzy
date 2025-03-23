import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  Chip,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CategoryIcon from '@mui/icons-material/Category';
import { useAuth } from '../../contexts/AuthContext';
import { friendService } from '../../services/friend';

interface GroupFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

interface Friend {
  id: string;
  name: string;
  email: string;
}

const GroupForm = ({ open, onClose, onSubmit, initialData, isEditing = false }: GroupFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');  // Add category state
  const [selectedMembers, setSelectedMembers] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Other');  // Set initial category
      setSelectedMembers(initialData.members || []);
    }
    fetchFriends();
  }, [initialData]);

  const fetchFriends = async () => {
    try {
      const response = await friendService.getFriends();
      setFriends(response);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to load friends list');
    }
  };

  const validateForm = () => {
    let isValid = true;
    if (!name.trim()) {
      setNameError('Group name is required');
      isValid = false;
    } else {
      setNameError(null);
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const groupData = {
        name: name.trim(),
        description: description.trim(),
        category: category,
        members: [...selectedMembers.map(member => member.id), user?.id]
      };

      await onSubmit(groupData);
      handleClose();
    } catch (err) {
      console.error('Error saving group:', err);
      setError('Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('Other');  // Reset category
    setSelectedMembers([]);
    setError(null);
    setNameError(null);
    onClose();
  };

  const availableFriends = friends.filter(
    friend => !selectedMembers.find(member => member.id === friend.id)
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" component="div" fontWeight={600}>
          {isEditing ? 'Edit Group' : 'Create New Group'}
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              label="Group Name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!nameError}
              helperText={nameError}
              autoFocus
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon sx={{ ml: 1, color: 'action.active' }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="Home">Home</MenuItem>
                <MenuItem value="Trip">Trip</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                gutterBottom
                sx={{ mb: 1 }}
              >
                Group Members
              </Typography>

              {/* Selected Members */}
              <Box 
                sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: selectedMembers.length > 0 ? 2 : 0
                }}
              >
                {/* Current User */}
                <Tooltip title="You">
                  <Chip
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user?.name?.[0]}
                      </Avatar>
                    }
                    label={user?.name}
                    variant="filled"
                    sx={{ 
                      bgcolor: 'primary.lighter',
                      '& .MuiChip-label': { color: 'primary.main' }
                    }}
                  />
                </Tooltip>

                {/* Selected Members */}
                {selectedMembers.map((member) => (
                  <Chip
                    key={member.id}
                    avatar={
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {member.name[0]}
                      </Avatar>
                    }
                    label={member.name}
                    onDelete={() => 
                      setSelectedMembers(members => 
                        members.filter(m => m.id !== member.id)
                      )
                    }
                    sx={{ 
                      bgcolor: 'secondary.lighter',
                      '& .MuiChip-label': { color: 'secondary.main' }
                    }}
                  />
                ))}
              </Box>

              {/* Friend Selector */}
              <Autocomplete
                multiple
                id="friend-select"
                options={availableFriends}
                getOptionLabel={(option) => option.name}
                value={[]}
                onChange={(_, newValue) => {
                  if (newValue.length > 0) {
                    const lastSelected = newValue[newValue.length - 1];
                    setSelectedMembers(prev => [...prev, lastSelected]);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder={
                      availableFriends.length > 0
                        ? "Add members..."
                        : "No more friends to add"
                    }
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PersonAddIcon color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.75rem',
                          bgcolor: 'secondary.main'
                        }}
                      >
                        {option.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </li>
                )}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {isEditing ? 'Save Changes' : 'Create Group'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GroupForm;