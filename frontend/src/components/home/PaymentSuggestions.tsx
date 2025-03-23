import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { PaymentSuggestion, PaymentToMake, PaymentToReceive, getPaymentSuggestions } from '../../services/balance';
import LoadingState from '../LoadingState';
import SettlementForm from '../settlements/SettlementForm';
import { useLocation } from 'react-router-dom';

interface SettlementTarget {
  id: string;
  name: string;
  email: string;
  amount: number;
}

interface PaymentSuggestionsProps {
  onSettlementSuccess?: () => void;
}

const PaymentSuggestions: React.FC<PaymentSuggestionsProps> = ({ onSettlementSuccess }) => {
  const [suggestions, setSuggestions] = useState<PaymentSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<SettlementTarget | null>(null);
  const location = useLocation();
  const theme = useTheme();
  
  useEffect(() => {
    fetchSuggestions();
  }, []);
  
  // Add effect to refresh when location changes (e.g., user navigates back to Dashboard)
  useEffect(() => {
    fetchSuggestions();
  }, [location.key]);
  
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const data = await getPaymentSuggestions();
      setSuggestions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment suggestions:', err);
      setError('Failed to load payment suggestions');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenSettlement = (target: SettlementTarget) => {
    setSelectedTarget(target);
    setShowSettlementForm(true);
  };
  
  const handleSettlementSuccess = () => {
    // Refresh payment suggestions after a successful settlement
    fetchSuggestions();
    // Call the parent callback if provided
    if (onSettlementSuccess) {
      onSettlementSuccess();
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 1.5 }}>
        <LoadingState type="circular" message="Loading suggestions..." height="80px" />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 1.5, color: 'error.main', fontSize: '0.875rem' }}>
        {error}
      </Box>
    );
  }
  
  if (suggestions.length === 0) {
    return (
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          All settled up! No payments needed.
        </Typography>
      </Box>
    );
  }
  
  const paymentsToPay = suggestions.find(s => s.type === 'youShouldPay')?.payments || [];
  const paymentsToReceive = suggestions.find(s => s.type === 'youShouldReceive')?.payments || [];
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <>
      <Box>
        {paymentsToPay.length > 0 && (
          <>
            {paymentsToPay.map((payment: PaymentToMake, index: number) => (
              <Box key={payment.to.id}>
                <ListItem
                  sx={{
                    px: 2,
                    py: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'error.lighter',
                        color: 'error.main',
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      {payment.to.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          Pay {payment.to.name}
                        </Typography>
                        <Chip
                          label={formatAmount(payment.amount)}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        For your share of expenses
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Settle up">
                        <IconButton
                          size="small"
                          color="primary"
                          sx={{ 
                            bgcolor: 'primary.lighter', 
                            '&:hover': { bgcolor: 'primary.light' } 
                          }}
                          onClick={() => handleOpenSettlement({
                            id: payment.to.id,
                            name: payment.to.name,
                            email: payment.to.email,
                            amount: payment.amount
                          })}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Email reminder">
                        <IconButton
                          size="small"
                          sx={{ 
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'action.selected' } 
                          }}
                          onClick={() => window.open(`mailto:${payment.to.email}?subject=Payment&body=I'm sending you ${formatAmount(payment.amount)} for my share of expenses.`)}
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </ListItem>
                {index < paymentsToPay.length - 1 && <Divider sx={{ mx: 2 }} />}
              </Box>
            ))}
          </>
        )}
        
        {paymentsToPay.length > 0 && paymentsToReceive.length > 0 && (
          <Divider />
        )}
        
        {paymentsToReceive.length > 0 && (
          <>
            {paymentsToReceive.map((payment: PaymentToReceive, index: number) => (
              <Box key={payment.from.id}>
                <ListItem
                  sx={{
                    px: 2,
                    py: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'success.lighter',
                        color: 'success.main',
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      {payment.from.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {payment.from.name} owes you
                        </Typography>
                        <Chip
                          label={formatAmount(payment.amount)}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        For their share of expenses
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Record payment">
                        <IconButton
                          size="small"
                          color="primary"
                          sx={{ 
                            bgcolor: 'primary.lighter', 
                            '&:hover': { bgcolor: 'primary.light' } 
                          }}
                          onClick={() => handleOpenSettlement({
                            id: payment.from.id,
                            name: payment.from.name,
                            email: payment.from.email,
                            amount: payment.amount
                          })}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send reminder">
                        <IconButton
                          size="small"
                          sx={{ 
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'action.selected' } 
                          }}
                          onClick={() => window.open(`mailto:${payment.from.email}?subject=Payment Reminder&body=This is a friendly reminder that you owe me ${formatAmount(payment.amount)} for your share of expenses.`)}
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </ListItem>
                {index < paymentsToReceive.length - 1 && <Divider sx={{ mx: 2 }} />}
              </Box>
            ))}
          </>
        )}
      </Box>
      
      {/* Settlement Form Dialog */}
      {selectedTarget && (
        <SettlementForm
          open={showSettlementForm}
          onClose={() => setShowSettlementForm(false)}
          onSuccess={handleSettlementSuccess}
          friend={selectedTarget}
          suggestedAmount={selectedTarget.amount}
          isRecordingPayment={!!suggestions.find(s => s.type === 'youShouldReceive')?.payments.find(p => (p as PaymentToReceive).from.id === selectedTarget.id)}
        />
      )}
    </>
  );
};

export default PaymentSuggestions;