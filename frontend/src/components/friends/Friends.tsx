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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { friendService } from '../../services/friend';
import LoadingState from '../LoadingState';
import FriendBalance from './FriendBalance';
import { getFriendBalances } from '../../services/balance';
import { useLocation } from 'react-router-dom';

interface Friend {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'requested';
}

interface FriendWithBalance extends Friend {
  balance?: number;
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
  const [friends, setFriends] = useState<FriendWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedFriend, setSelectedFriend] = useState<FriendWithBalance | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    loadFriendsData();
  }, []);
  
  // Add effect to refresh data when navigating back to this component
  useEffect(() => {
    // This will refresh when user navigates back to Friends page or when location changes
    loadFriendsData();
  }, [location.key]);
  
  const loadFriendsData = async () => {
    try {
      setLoading(true);
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
      
      // Get balances for all friends
      try {
        const balances = await getFriendBalances();
        
        // Merge balances with friends
        const friendsWithBalances = formattedFriends.map(friend => {
          const balanceInfo = balances.find(b => b.id === friend.id);
          return {
            ...friend,
            balance: balanceInfo?.balance
          };
        });
        
        setFriends(friendsWithBalances);
      } catch (balanceErr) {
        console.error('Error loading balances:', balanceErr);
        setFriends(formattedFriends);
      }
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

  const handleSettlementSuccess = () => {
    loadFriendsData();
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
    setShowBalance(false);
    setSelectedFriend(null);
  };

  const handleFriendClick = (friend: FriendWithBalance) => {
    if (friend.status === 'accepted') {
      setSelectedFriend(friend);
      setShowBalance(true);
    }
  };

  const handleBackToList = () => {
    setShowBalance(false);
    setSelectedFriend(null);
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

  const getBalanceText = (balance?: number) => {
    if (balance === undefined) return null;
    if (balance === 0) return "You're all settled up";
    if (balance > 0) return `Owes you $${balance.toFixed(2)}`;
    return `You owe $${Math.abs(balance).toFixed(2)}`;
  };

  const getBalanceColor = (balance?: number) => {
    if (balance === undefined) return 'text.secondary';
    if (balance === 0) return 'text.secondary';
    if (balance > 0) return 'success.main';
    return 'error.main';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <LoadingState type="pulse" message="Loading friends..." height="400px" />
      </Container>
    );
  }

  if (showBalance && selectedFriend) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 4 }}>
          <Button 
            variant="text" 
            onClick={handleBackToList}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                transform: 'translateX(-4px)'
              },
              transition: 'all 0.2s ease'
            }}
            startIcon={<ArrowBackIcon />}
          >
            Back to friends
          </Button>
        </Box>
        <FriendBalance 
          friendId={selectedFriend.id} 
          friendName={selectedFriend.name}
          onSettlementSuccess={handleSettlementSuccess}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: { xs: 4, md: 5 },
          position: 'relative'
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4F6BFF 0%, #7C4DFF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              mb: 1
            }}
          >
            Friends
          </Typography>
          <Typography 
            color="text.secondary" 
            variant="body1"
            sx={{ maxWidth: 480 }}
          >
            Manage your connections and track shared expenses with friends
          </Typography>
        </Box>
        <IconButton
          onClick={() => setIsAddFriendOpen(true)}
          sx={{
            ml: 'auto',
            width: 48,
            height: 48,
            backgroundColor: 'primary.lighter',
            color: 'primary.main',
            transition: 'all 0.2s ease-in-out',
            '&:hover': { 
              transform: 'rotate(90deg)',
              backgroundColor: 'primary.light'
            }
          }}
        >
          <PersonAddIcon />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
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
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 500,
              py: 2,
              minHeight: 56,
              textTransform: 'none'
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 600
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: 'primary.main'
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
                  cursor: friend.status === 'accepted' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    bgcolor: 'action.hover',
                    transform: friend.status === 'accepted' ? 'translateX(8px)' : 'none'
                  }
                }}
                onClick={() => handleFriendClick(friend)}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      width: 50, 
                      height: 50,
                      bgcolor: friend.status === 'accepted' ? 'primary.main' : 'secondary.main',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      },
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {friend.email}
                      </Typography>
                      {friend.status === 'accepted' && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mt: 0.5,
                            fontWeight: 500, 
                            color: getBalanceColor(friend.balance)
                          }}
                        >
                          {getBalanceText(friend.balance)}
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{ ml: 2 }}
                />
                {friend.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptRequest(friend.id);
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        minWidth: 100,
                        boxShadow: 'none',
                        background: 'linear-gradient(135deg, #4F6BFF 0%, #7C4DFF 100%)',
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectRequest(friend.id);
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        minWidth: 100,
                        '&:hover': {
                          bgcolor: 'error.lighter',
                          borderColor: 'error.light',
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
            <Box 
              sx={{ 
                p: 6, 
                textAlign: 'center',
                color: 'text.secondary',
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                {activeTab === 0 ? "You haven't added any friends yet" :
                 activeTab === 1 ? "No pending friend requests" :
                 "No sent friend requests"}
              </Typography>
              {activeTab === 0 && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setIsAddFriendOpen(true)}
                  sx={{
                    mt: 2,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Add Your First Friend
                </Button>
              )}
            </Box>
          )}
        </List>
      </Paper>

      {/* Add Friend Dialog */}
      <Dialog 
        open={isAddFriendOpen} 
        onClose={() => setIsAddFriendOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 'sm',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          '& .MuiTypography-root': {
            fontSize: '1.5rem',
            fontWeight: 600
          }
        }}>
          Add Friend
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Enter your friend's email address to send them a friend request
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Friend's Email"
            type="email"
            fullWidth
            variant="outlined"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setIsAddFriendOpen(false)}
            sx={{ 
              textTransform: 'none',
              color: 'text.secondary'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddFriend} 
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #4F6BFF 0%, #7C4DFF 100%)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Friends;