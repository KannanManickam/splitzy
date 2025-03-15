import React, { useState, useEffect } from 'react';
import { friendService } from '../../services/friend';
import { useAuth } from '../../contexts/AuthContext';
import { Group } from '../../services/group';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import TitleIcon from '@mui/icons-material/Title';

interface Friend {
  id: string;
  name: string;
  email: string;
}

interface GroupFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GroupFormData) => void;
  initialData?: Group;
  isEditing?: boolean;
}

export interface GroupFormData {
  name: string;
  description: string;
  category: string;
  members: string[];
}

const categories = ['Home', 'Trip', 'Other'];

const GroupForm: React.FC<GroupFormProps> = ({
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
  
  const [formData, setFormData] = useState<GroupFormData>(
    initialData ? {
      name: initialData.name,
      description: initialData.description || '',
      category: initialData.category,
      members: initialData.members.map(member => member.id),
    } : {
      name: '',
      description: '',
      category: 'Other',
      members: user ? [user.id] : [],
    }
  );

  useEffect(() => {
    if (initialData && open) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        category: initialData.category,
        members: initialData.members.map(member => member.id),
      });
    } else if (!initialData && open) {
      setFormData({
        name: '',
        description: '',
        category: 'Other',
        members: user ? [user.id] : [],
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          {isEditing ? 'Edit Group' : 'Create New Group'}
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
              label="Group Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon sx={{ color: 'info.main' }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleSelectChange}
                label="Category"
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                }
              >
                {categories.map((category) => (
                  <MenuItem 
                    key={category} 
                    value={category}
                    sx={{
                      '&:hover': {
                        bgcolor: 'primary.lighter'
                      }
                    }}
                  >
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Members</InputLabel>
              <Select
                multiple
                name="members"
                value={formData.members}
                onChange={handleSelectChange}
                input={<OutlinedInput label="Members" />}
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
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
            disabled={loading || !formData.name || formData.members.length === 0}
            sx={{
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {isEditing ? 'Save Changes' : 'Create Group'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GroupForm;