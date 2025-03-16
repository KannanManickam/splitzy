import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  CircularProgress,
  Snackbar,
  useTheme,
  InputAdornment,
  IconButton,
  Zoom
} from '@mui/material';
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountBalance as LogoIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { login, LoginData } from '../../services/auth';

interface LoginFormData extends LoginData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await login(formData);
      
      if (!response?.token || !response?.user) {
        throw new Error('Invalid response from server');
      }
      auth.login(response.token, response.user);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Zoom in={true} timeout={500}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 6 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }}
          >
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogoIcon sx={{ fontSize: 40 }} />
            </Box>

            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                mb: 1, 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome Back
            </Typography>

            <Typography 
              variant="body1" 
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Sign in to manage your expenses and groups
            </Typography>

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ width: '100%' }}
              noValidate
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
                error={Boolean(error)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color={error ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: '0.2s',
                    '&:hover, &.Mui-focused': {
                      bgcolor: 'action.hover',
                    }
                  }
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                error={Boolean(error)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color={error ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: '0.2s',
                    '&:hover, &.Mui-focused': {
                      bgcolor: 'action.hover',
                    }
                  }
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 4,
                  mb: 2,
                  height: 56,
                  position: 'relative',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: `0 8px 20px -6px ${theme.palette.primary.main}80`
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircularProgress 
                      size={24} 
                      sx={{ 
                        position: 'absolute',
                        left: 24,
                        color: 'primary.light' 
                      }} 
                    />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/register')}
                disabled={isLoading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                  color: 'text.secondary',
                  '&:hover': {
                    background: 'transparent',
                    color: 'primary.main'
                  }
                }}
              >
                Don't have an account? Sign Up
              </Button>
            </Box>
          </Paper>
        </Zoom>
      </Container>

      <Snackbar 
        open={Boolean(error)} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}