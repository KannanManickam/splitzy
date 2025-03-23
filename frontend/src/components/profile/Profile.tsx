import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Avatar, 
  Grid,
  useTheme,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
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
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreferencesDialogOpen, setIsPreferencesDialogOpen] = useState(false);

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
        {/* Header Background */}
        <Paper 
          elevation={0} 
          sx={{ 
            height: '160px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            mb: -12,
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
        
        {/* Main Content */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            mx: { xs: 2, md: 4 },
            mt: { xs: 6, sm: 8 },
            position: 'relative',
          }}
        >
          {/* Profile Header - New Layout */}
          <Box sx={{ position: 'relative' }}>
            {/* Avatar positioned at the top */}
            <Avatar
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                border: `4px solid ${theme.palette.background.paper}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                position: 'absolute',
                top: -50,
                left: 32,
                zIndex: 1,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05) rotate(5deg)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {user.name.charAt(0)}
            </Avatar>

            {/* Name and Edit Button Container */}
            <Box 
              sx={{ 
                pt: 7,
                pb: 3,
                pl: { xs: 2, sm: 4 },
                pr: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', sm: '2.25rem' },
                    color: 'text.primary',
                  }}
                >
                  {user.name}
                </Typography>
                <Tooltip title="Edit Profile">
                  <IconButton 
                    onClick={handleEditClick}
                    sx={{ 
                      ml: 2,
                      color: 'primary.main',
                      bgcolor: 'primary.lighter',
                      '&:hover': { 
                        bgcolor: 'primary.light',
                        transform: 'rotate(15deg)',
                      }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* User Info Grid */}
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Member Since
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />
          </Box>

          {/* Quick Actions */}
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            Quick Actions
          </Typography>
          <Grid 
            container 
            spacing={2}
            sx={{
              '& .MuiButton-root': {
                height: '100%',
                minHeight: 56,
                width: '100%',
                borderRadius: 2,
                borderWidth: 1,
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderWidth: 1,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }
            }}
          >
            <Grid item xs={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<GroupIcon />}
                onClick={() => navigate('/friends')}
              >
                My Friends
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<ReceiptLongIcon />}
                onClick={() => navigate('/expenses')}
              >
                My Expenses
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<AccountBalanceWalletIcon />}
                onClick={() => navigate('/settlements')}
              >
                My Settlements
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={handlePreferencesClick}
              >
                Settings
              </Button>
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