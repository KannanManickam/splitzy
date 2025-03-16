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
  Card,
  CardContent
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PaymentSuggestion, PaymentToMake, PaymentToReceive, getPaymentSuggestions } from '../../services/balance';
import LoadingState from '../LoadingState';

const PaymentSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<PaymentSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LoadingState type="circular" message="Loading payment suggestions..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        {error}
      </Box>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Suggestions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You're all settled up! No payments needed.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const paymentsToPay = suggestions.find(s => s.type === 'youShouldPay')?.payments || [];
  const paymentsToReceive = suggestions.find(s => s.type === 'youShouldReceive')?.payments || [];

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payment Suggestions
        </Typography>

        {paymentsToPay.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
              Payments to make
            </Typography>
            <List>
              {(paymentsToPay as PaymentToMake[]).map((payment) => (
                <React.Fragment key={payment.to.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <ArrowForwardIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Pay ${payment.to.name}`}
                      secondary={`You owe $${payment.amount.toFixed(2)}`}
                    />
                    <Button 
                      variant="contained" 
                      size="small" 
                      sx={{ ml: 2 }}
                      onClick={() => window.open(`mailto:${payment.to.email}?subject=Payment&body=I'm sending you $${payment.amount.toFixed(2)} for my share of expenses.`)}
                    >
                      Settle Up
                    </Button>
                  </ListItem>
                  {payment !== paymentsToPay[paymentsToPay.length - 1] && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}

        {paymentsToReceive.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
              Payments to receive
            </Typography>
            <List>
              {(paymentsToReceive as PaymentToReceive[]).map((payment) => (
                <React.Fragment key={payment.from.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <ArrowBackIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${payment.from.name} owes you`}
                      secondary={`$${payment.amount.toFixed(2)}`}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ ml: 2 }}
                      onClick={() => window.open(`mailto:${payment.from.email}?subject=Payment Reminder&body=This is a friendly reminder that you owe me $${payment.amount.toFixed(2)} for your share of expenses.`)}
                    >
                      Remind
                    </Button>
                  </ListItem>
                  {payment !== paymentsToReceive[paymentsToReceive.length - 1] && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSuggestions;