import React from 'react';
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
  useTheme
} from '@mui/material';
import { GroupBalance, GroupSettlementSuggestion } from '../../services/groupExpense';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import { useAuth } from '../../contexts/AuthContext';

interface GroupBalancesProps {
  balances: GroupBalance[];
  settlements: GroupSettlementSuggestion[];
}

const GroupBalances: React.FC<GroupBalancesProps> = ({ balances, settlements }) => {
  const theme = useTheme();
  const { user } = useAuth();

  const renderBalanceAmount = (amount: number) => {
    const isPositive = amount > 0;
    const color = isPositive ? 'success.main' : amount < 0 ? 'error.main' : 'text.secondary';
    const bgColor = isPositive ? 'success.lighter' : amount < 0 ? 'error.lighter' : 'grey.100';
    
    return (
      <Typography
        variant="body2"
        sx={{
          color,
          bgcolor: bgColor,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          display: 'inline-block'
        }}
      >
        {isPositive ? '+' : ''}{amount.toFixed(2)}
      </Typography>
    );
  };

  return (
    <Stack spacing={3}>
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
              <ListItem sx={{ py: 1.5 }}>
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
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            bgcolor: 'primary.lighter',
                            color: 'primary.main',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1
                          }}
                        >
                          You
                        </Typography>
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
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <PaymentIcon sx={{ color: 'info.main' }} />
            Suggested Settlements
          </Typography>
          <List disablePadding>
            {settlements.map((settlement, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <ListItem sx={{ py: 1.5 }}>
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
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                bgcolor: 'primary.lighter',
                                color: 'primary.main',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1
                              }}
                            >
                              You
                            </Typography>
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
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                bgcolor: 'primary.lighter',
                                color: 'primary.main',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1
                              }}
                            >
                              You
                            </Typography>
                          )}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 1,
                          color: 'info.main',
                          bgcolor: 'info.lighter',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        ${settlement.amount.toFixed(2)}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Stack>
  );
};

export default GroupBalances;