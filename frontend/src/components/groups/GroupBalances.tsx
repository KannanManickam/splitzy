import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Stack,
  useTheme,
  Button,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import { GroupBalance, GroupSettlementSuggestion } from '../../services/groupExpense';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../contexts/AuthContext';
import SettlementForm from '../settlements/SettlementForm';

interface GroupBalancesProps {
  balances: GroupBalance[];
  settlements: GroupSettlementSuggestion[];
  groupId: string;
  onSettlementSuccess?: () => void;
}

const GroupBalances: React.FC<GroupBalancesProps> = ({ 
  balances, 
  settlements, 
  groupId,
  onSettlementSuccess 
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [showSettlementForm, setShowSettlementForm] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<{
    friend: { id: string; name: string; email: string };
    amount: number;
  } | null>(null);

  const handleOpenSettlement = (settlement: GroupSettlementSuggestion) => {
    const isUserPayer = settlement.from.id === user?.id;
    const friend = isUserPayer ? settlement.to : settlement.from;
    
    setSelectedSettlement({
      friend,
      amount: settlement.amount
    });
    
    setShowSettlementForm(true);
  };

  const handleSettlementSuccess = () => {
    setShowSettlementForm(false);
    setShowSuccessAlert(true);
    if (onSettlementSuccess) {
      onSettlementSuccess();
    }
  };

  const renderBalanceAmount = (amount: number) => {
    const isPositive = amount > 0;
    const color = isPositive ? 'success.main' : amount < 0 ? 'error.main' : 'text.secondary';
    const bgColor = isPositive ? 'success.lighter' : amount < 0 ? 'error.lighter' : 'grey.100';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {amount !== 0 && (
          isPositive ? 
            <TrendingUpIcon sx={{ color: 'success.main' }} /> : 
            <TrendingDownIcon sx={{ color: 'error.main' }} />
        )}
        <Typography
          variant="body2"
          sx={{
            color,
            bgcolor: bgColor,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            display: 'inline-block',
            fontWeight: 500
          }}
        >
          {isPositive ? '+' : ''}{amount.toFixed(2)}
        </Typography>
      </Box>
    );
  };

  return (
    <Stack spacing={3}>
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={3000}
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowSuccessAlert(false)}
          icon={<CheckCircleIcon />}
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              color: 'success.main'
            }
          }}
        >
          Settlement completed successfully!
        </Alert>
      </Snackbar>

      {/* Summary Section */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2,
            flexGrow: 1,
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.light',
            borderRadius: 2,
            minWidth: 200
          }}
        >
          <Typography color="success.darker" variant="subtitle2" gutterBottom>
            Total to Receive
          </Typography>
          <Typography color="success.darker" variant="h5" fontWeight={600}>
            ${balances
              .filter(b => b.balance > 0)
              .reduce((sum, b) => sum + b.balance, 0)
              .toFixed(2)}
          </Typography>
        </Paper>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 2,
            flexGrow: 1,
            bgcolor: 'error.lighter',
            border: '1px solid',
            borderColor: 'error.light',
            borderRadius: 2,
            minWidth: 200
          }}
        >
          <Typography color="error.darker" variant="subtitle2" gutterBottom>
            Total to Pay
          </Typography>
          <Typography color="error.darker" variant="h5" fontWeight={600}>
            ${Math.abs(balances
              .filter(b => b.balance < 0)
              .reduce((sum, b) => sum + b.balance, 0))
              .toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      {/* Overall Balances */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AccountBalanceIcon sx={{ color: 'primary.main' }} />
          Current Balances
        </Typography>
        <List disablePadding>
          {balances.map((balance, index) => (
            <React.Fragment key={balance.userId}>
              {index > 0 && <Divider />}
              <ListItem 
                sx={{ 
                  py: 1.5,
                  px: 2,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: balance.userId === user?.id ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem'
                    }}
                  >
                    {balance.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {balance.name}
                      {balance.userId === user?.id && (
                        <Chip 
                          label="You"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ height: 20 }}
                        />
                      )}
                    </Box>
                  }
                />
                <Box>
                  {renderBalanceAmount(balance.balance)}
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Settlement Suggestions */}
      {settlements.length > 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <PaymentIcon sx={{ color: 'info.main' }} />
              Suggested Settlements
            </Typography>
          </Box>

          <List disablePadding>
            {settlements.map((settlement, index) => {
              const isUserInvolved = settlement.from.id === user?.id || settlement.to.id === user?.id;
              
              return (
                <React.Fragment key={index}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{ 
                      py: 2,
                      px: 2,
                      bgcolor: isUserInvolved ? 'action.hover' : 'transparent',
                      borderRadius: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isUserInvolved ? 'action.selected' : 'action.hover',
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          alignItems="center"
                          sx={{
                            '& .MuiTypography-root': {
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }
                          }}
                        >
                          <Typography>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                fontSize: '0.75rem',
                                bgcolor: settlement.from.id === user?.id ? 'primary.main' : 'secondary.main'
                              }}
                            >
                              {settlement.from.name[0]}
                            </Avatar>
                            {settlement.from.name}
                            {settlement.from.id === user?.id && (
                              <Chip 
                                label="You"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            )}
                          </Typography>
                          <ArrowRightAltIcon sx={{ color: theme.palette.text.secondary }} />
                          <Typography>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                fontSize: '0.75rem',
                                bgcolor: settlement.to.id === user?.id ? 'primary.main' : 'secondary.main'
                              }}
                            >
                              {settlement.to.name[0]}
                            </Avatar>
                            {settlement.to.name}
                            {settlement.to.id === user?.id && (
                              <Chip 
                                label="You"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            )}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: 'info.main',
                              bgcolor: 'info.lighter',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block',
                              fontWeight: 500
                            }}
                          >
                            ${settlement.amount.toFixed(2)}
                          </Typography>
                          {isUserInvolved && (
                            <Typography variant="body2" color="text.secondary">
                              {settlement.from.id === user?.id 
                                ? `You owe ${settlement.to.name}`
                                : `${settlement.from.name} owes you`}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {isUserInvolved && (
                      <Button 
                        variant="contained"
                        size="medium"
                        color="primary"
                        onClick={() => handleOpenSettlement(settlement)}
                        startIcon={<PaymentIcon />}
                        sx={{ 
                          borderRadius: 2,
                          minWidth: 120,
                          boxShadow: 2,
                          '&:hover': {
                            boxShadow: 4
                          }
                        }}
                      >
                        Settle Up
                      </Button>
                    )}
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}

      {/* Settlement Form */}
      {selectedSettlement && (
        <SettlementForm
          open={showSettlementForm}
          onClose={() => setShowSettlementForm(false)}
          onSuccess={handleSettlementSuccess}
          friend={selectedSettlement.friend}
          groupId={groupId}
          suggestedAmount={selectedSettlement.amount}
        />
      )}
    </Stack>
  );
};

export default GroupBalances;