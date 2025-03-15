import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Avatar, 
  Grid,
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Helper function to format date safely
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    // Check if the date is valid
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
            height: '200px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            mb: -10,
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
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: 6,
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
                bgcolor: 'primary.main',
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
                bgcolor: theme.palette.primary.main,
                fontSize: { xs: '2.5rem', md: '3rem' },
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
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                textAlign: 'center',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {user.name}
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ 
                textAlign: 'center',
                maxWidth: '600px',
                mt: 1
              }}
            >
              Welcome to your profile! Here you can view your account information and details.
            </Typography>
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
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;