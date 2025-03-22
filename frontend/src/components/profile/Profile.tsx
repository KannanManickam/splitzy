import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Avatar, 
  Grid,
  useTheme,
  Card,
  CardContent,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import ProfileEdit from './ProfileEdit';
import PreferencesForm from './PreferencesForm';
import { useState } from 'react';

// Helper function to format date safely
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

const Profile = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
  };

  const handlePreferencesClick = () => {
    setIsPreferencesDialogOpen(true);
  };

  const handlePreferencesClose = () => {
    setIsPreferencesDialogOpen(false);
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 6 }, mb: { xs: 3, md: 6 } }}>
      <Box sx={{ position: 'relative' }}>
        {/* Background Card */}
        <Paper 
          elevation={0} 
          sx={{ 
            height: '240px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            mb: -10,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
              top: '-50%',
              left: '-50%',
              animation: 'rotate 60s linear infinite'
            }
          }}
        />
        
        {/* Profile Content */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            mx: { xs: 2, md: 4 },
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {/* Profile Header */}
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            mb={4}
            sx={{
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                borderRadius: '2px'
              }
            }}
          >
            <Avatar
              sx={{
                width: { xs: 120, md: 140 },
                height: { xs: 120, md: 140 },
                mb: 3,
                border: `4px solid ${theme.palette.background.paper}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05) rotate(5deg)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  display: 'inline-block'
                }}
              >
                {user.name}
                <Tooltip title="Edit Profile">
                  <IconButton 
                    size="small" 
                    onClick={handleEditClick}
                    sx={{ 
                      ml: 1,
                      color: 'primary.main',
                      '&:hover': {
                        transform: 'rotate(15deg)'
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ 
                  maxWidth: '600px',
                  mt: 1
                }}
              >
                Welcome to your profile! Here you can view and manage your account settings.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {/* Email Card */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.1)',
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <EmailIcon 
                      sx={{ 
                        fontSize: 28, 
                        color: 'text.secondary',
                        transition: 'all 0.2s ease-in-out',
                        mr: 1
                      }} 
                    />
                    <Typography variant="h6" color="text.secondary">
                      Email Address
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 500,
                      wordBreak: 'break-word',
                      pl: 0.5
                    }}
                  >
                    {user.email}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Member Since Card */}
            <Grid item xs={12} md={6}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.1)',
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CalendarTodayIcon 
                      sx={{ 
                        fontSize: 28, 
                        color: 'text.secondary',
                        transition: 'all 0.2s ease-in-out',
                        mr: 1
                      }} 
                    />
                    <Typography variant="h6" color="text.secondary">
                      Member Since
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 500,
                      pl: 0.5
                    }}
                  >
                    {formatDate(user.createdAt)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Links Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  color: 'text.secondary',
                  fontWeight: 500
                }}
              >
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GroupIcon />}
                    onClick={() => navigate('/friends')}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      borderWidth: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    My Friends
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReceiptLongIcon />}
                    onClick={() => navigate('/expenses')}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      borderWidth: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    My Expenses
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={() => navigate('/settlements')}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      borderWidth: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    My Settlements
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={handlePreferencesClick}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      borderWidth: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Preferences
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      borderWidth: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                        bgcolor: 'error.lighter'
                      }
                    }}
                  >
                    Sign Out
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Dialogs */}
      <ProfileEdit 
        open={isEditDialogOpen}
        onClose={handleEditClose}
      />
      <PreferencesForm
        open={isPreferencesDialogOpen}
        onClose={handlePreferencesClose}
      />
    </Container>
  );
};

export default Profile;