import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  AlertColor,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { friendService } from '../../services/friend';

interface Friend {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'requested';
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const Friends = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchEmail, setSearchEmail] = useState('');
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    try {
      const [friendsList, pendingRequests, sentRequests] = await Promise.all([
        friendService.getFriends(),
        friendService.getPendingRequests(),
        friendService.getSentRequests(),
      ]);

      const formattedFriends = [
        ...friendsList.map(friend => ({ ...friend, status: 'accepted' as const })),
        ...pendingRequests.map(request => ({ ...request, status: 'pending' as const })),
        ...sentRequests.map(request => ({ ...request, status: 'requested' as const })),
      ];

      setFriends(formattedFriends);
    } catch (err) {
      console.error('Error loading friends:', err);
      setNotification({
        open: true,
        message: 'Failed to load friends',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      await friendService.sendFriendRequest(searchEmail);
      setNotification({
        open: true,
        message: 'Friend request sent successfully',
        severity: 'success'
      });
      loadFriendsData();
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to send friend request',
        severity: 'error'
      });
    }
    setSearchEmail('');
    setIsAddFriendOpen(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      setNotification({
        open: true,
        message: 'Friend request accepted',
        severity: 'success'
      });
      loadFriendsData();
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to accept friend request',
        severity: 'error'
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      setNotification({
        open: true,
        message: 'Friend request rejected',
        severity: 'success'
      });
      loadFriendsData();
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to reject friend request',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getFilteredFriends = () => {
    switch (activeTab) {
      case 0: // All Friends
        return friends.filter(friend => friend.status === 'accepted');
      case 1: // Pending Requests
        return friends.filter(friend => friend.status === 'pending');
      case 2: // Sent Requests
        return friends.filter(friend => friend.status === 'requested');
      default:
        return [];
    }
  };

  const getStatusChip = (status: Friend['status']) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'accepted':
        return <Chip label="Friend" color="success" size="small" />;
      case 'requested':
        return <Chip label="Requested" color="info" size="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: { xs: 4, md: 5 },
        position: 'relative'
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
          }}
        >
          Friends
        </Typography>
        <IconButton
          onClick={() => setIsAddFriendOpen(true)}
          color="primary"
          sx={{
            ml: 'auto',
            transition: 'all 0.2s ease-in-out',
            bgcolor: 'rgba(25, 118, 210, 0.08)',
            '&:hover': { 
              transform: 'scale(1.1)',
              bgcolor: 'rgba(25, 118, 210, 0.15)'
            }
          }}
        >
          <PersonAddIcon />
        </IconButton>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
          }
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              py: 2
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 600
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="Friends" />
          <Tab label="Pending Requests" />
          <Tab label="Sent Requests" />
        </Tabs>

        <List sx={{ p: 0 }}>
          {getFilteredFriends().map((friend, index) => (
            <Box key={friend.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  p: 3,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    bgcolor: 'rgba(0,0,0,0.02)',
                    transform: 'translateX(8px)'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      width: 50, 
                      height: 50,
                      bgcolor: 'primary.main',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {friend.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {friend.name}
                      </Typography>
                      {getStatusChip(friend.status)}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {friend.email}
                    </Typography>
                  }
                  sx={{ ml: 2 }}
                />
                {friend.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => handleAcceptRequest(friend.id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        minWidth: 100,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleRejectRequest(friend.id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        minWidth: 100,
                        '&:hover': {
                          bgcolor: 'error.lighter',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Decline
                    </Button>
                  </Box>
                )}
              </ListItem>
            </Box>
          ))}
          {getFilteredFriends().length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {activeTab === 0 ? "You haven't added any friends yet" :
                 activeTab === 1 ? "No pending friend requests" :
                 "No sent friend requests"}
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      <Dialog open={isAddFriendOpen} onClose={() => setIsAddFriendOpen(false)}>
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Friend's Email"
            type="email"
            fullWidth
            variant="outlined"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setIsAddFriendOpen(false)}>Cancel</Button>
          <Button onClick={handleAddFriend} variant="contained">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Friends;