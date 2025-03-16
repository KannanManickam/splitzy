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
  useTheme,
  InputAdornment,
  IconButton,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountBalance as LogoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { register, RegisterData } from '../../services/auth';

interface RegisterFormData extends RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      // Show success dialog
      setShowSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration');
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
                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
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
              Create Account
            </Typography>

            <Typography 
              variant="body1" 
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              Join us to start managing your expenses efficiently
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
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isLoading}
                error={Boolean(error)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color={error ? 'error' : 'action'} />
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                autoComplete="new-password"
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

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Passwords do not match' : ''}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color={error ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                color="primary"
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
                        color: 'secondary.light' 
                      }} 
                    />
                    Creating Account...
                  </>
                ) : 'Sign Up'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                disabled={isLoading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                  color: 'text.secondary',
                  '&:hover': {
                    background: 'transparent',
                    color: 'secondary.main'
                  }
                }}
              >
                Already have an account? Sign In
              </Button>
            </Box>
          </Paper>
        </Zoom>
      </Container>

      {/* Success Dialog */}
      <Dialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          color: 'success.main'
        }}>
          <CheckCircleIcon color="success" />
          Registration Successful!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your account has been created successfully. You can now sign in using your email and password.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: 2, justifyContent: 'center' }}>
          <Button
            onClick={() => navigate('/login')}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: 120
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 300,
            maxWidth: '90%',
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
}