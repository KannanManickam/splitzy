import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, List, Button, Tabs, Tab } from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon 
} from '@mui/icons-material';
import { getBalanceWithFriend, ExpenseHistoryItem } from '../../services/balance';
import { settlementService, BalanceWithSettlements } from '../../services/settlement';
import { formatDate } from '../../utils/dateUtils';
import SettlementForm from '../settlements/SettlementForm';
import SettlementHistory from '../settlements/SettlementHistory';

interface FriendBalanceProps {
  friendId: string;
  friendName: string;
  onSettlementSuccess?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`balance-tabpanel-${index}`}
      aria-labelledby={`balance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FriendBalance: React.FC<FriendBalanceProps> = ({ friendId, friendName, onSettlementSuccess }) => {
  const [balanceDetails, setBalanceDetails] = useState<{
    balance: number;
    expenseHistory: ExpenseHistoryItem[];
  } | null>(null);
  
  const [settledBalanceDetails, setSettledBalanceDetails] = useState<BalanceWithSettlements | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showSettlementForm, setShowSettlementForm] = useState(false);

  // Function to handle tab changes
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  React.useEffect(() => {
    const fetchBalanceDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch original expense-based balance
        const expenseData = await getBalanceWithFriend(friendId);
        setBalanceDetails(expenseData);
        
        // Fetch balance including settlements
        const settledData = await settlementService.getSettlementsWithFriend(friendId);
        setSettledBalanceDetails(settledData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching balance details:', err);
        setError('Failed to load balance details');
      } finally {
        setLoading(false);
      }
    };

    if (friendId) {
      fetchBalanceDetails();
    }
  }, [friendId]);

  const handleSettlementSuccess = async () => {
    try {
      // Refresh the settled balance data after successful settlement
      const settledData = await settlementService.getSettlementsWithFriend(friendId);
      setSettledBalanceDetails(settledData);
      
      // Call the parent callback if provided
      if (onSettlementSuccess) {
        onSettlementSuccess();
      }
    } catch (err) {
      console.error('Error refreshing balance data:', err);
    }
  };

  if (loading) {
    return <Box sx={{ p: 2 }}>Loading balance details...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 2, color: 'error.main' }}>{error}</Box>;
  }

  if (!balanceDetails) {
    return <Box sx={{ p: 2 }}>No balance information available</Box>;
  }

  const { balance, expenseHistory } = balanceDetails;
  
  // Extract net balance and settlements from settled data
  const netBalance = settledBalanceDetails?.netBalance || balance;
  const isNetPositive = netBalance > 0;
  const isNetNegative = netBalance < 0;
  const hasSettlements = settledBalanceDetails?.settlements && settledBalanceDetails.settlements.length > 0;

  return (
    <Box sx={{ mt: 3 }}>
      {/* Balance Card */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(to right, #F8FAFC, #F1F5F9)',
          borderRadius: '16px',
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        {isNetPositive && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(to bottom, #10B981, #059669)'
          }} />
        )}
        {isNetNegative && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(to bottom, #EF4444, #DC2626)'
          }} />
        )}
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1
                }}
              >
                {isNetPositive ? `${friendName} owes you` :
                 isNetNegative ? `You owe ${friendName}` :
                 `You are settled up`}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: isNetPositive ? '#10B981' :
                         isNetNegative ? '#EF4444' :
                         '#64748B'
                }}
              >
                ${Math.abs(netBalance).toFixed(2)}
              </Typography>
            </Box>

            {(isNetPositive || isNetNegative) && (
              <Button
                variant="contained"
                onClick={() => setShowSettlementForm(true)}
                startIcon={<WalletIcon />}
                sx={{
                  background: 'linear-gradient(to right, #4F6BFF, #7C4DFF)',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 6px rgba(124, 77, 255, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 8px rgba(124, 77, 255, 0.25)'
                  }
                }}
              >
                {isNetPositive ? 'Record Payment' : 'Settle Up'}
              </Button>
            )}
          </Box>

          {hasSettlements && (
            <Box sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <InfoIcon sx={{ color: '#64748B', fontSize: '1rem' }} />
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Includes {settledBalanceDetails?.settlements.length} settlements
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        mb: 3
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              color: '#64748B',
              '&.Mui-selected': {
                color: '#4F6BFF'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4F6BFF'
            }
          }}
        >
          <Tab label="Expenses" />
          <Tab label="Settlements" />
        </Tabs>
      </Box>

      {/* Expenses Tab Panel */}
      <TabPanel value={tabValue} index={0}>
        <List sx={{ width: '100%' }}>
          {expenseHistory.length > 0 ? (
            expenseHistory.map((expense) => (
              <Card
                key={expense.id}
                sx={{
                  mb: 2,
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: expense.type === 'youPaid' ? '#EBF5FF' : '#FDF2F2'
                      }}
                    >
                      {expense.type === 'youPaid' 
                        ? <ArrowUpwardIcon sx={{ color: '#3B82F6' }} />
                        : <ArrowDownwardIcon sx={{ color: '#EF4444' }} />
                      }
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {expense.description}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                        {formatDate(expense.date)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: expense.type === 'youPaid' ? '#10B981' : '#EF4444',
                          fontWeight: 500
                        }}
                      >
                        {expense.type === 'youPaid'
                          ? `You paid $${expense.totalAmount.toFixed(2)}`
                          : `${friendName} paid $${expense.totalAmount.toFixed(2)}`
                        }
                      </Typography>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: expense.type === 'youPaid' ? '#10B981' : '#EF4444'
                      }}
                    >
                      ${expense.type === 'youPaid' 
                        ? expense.friendOwes?.toFixed(2)
                        : expense.youOwe?.toFixed(2)
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: '#64748B', textAlign: 'center', py: 4 }}>
              No expenses found with this friend.
            </Typography>
          )}
        </List>
      </TabPanel>

      {/* Settlements Tab Panel */}
      <TabPanel value={tabValue} index={1}>
        <SettlementHistory 
          friendId={friendId} 
          onDelete={handleSettlementSuccess}
        />
      </TabPanel>

      {/* Settlement Form Dialog */}
      <SettlementForm
        open={showSettlementForm}
        onClose={() => setShowSettlementForm(false)}
        onSuccess={handleSettlementSuccess}
        friend={{ id: friendId, name: friendName, email: '' }}
        suggestedAmount={Math.abs(netBalance)}
        isRecordingPayment={isNetPositive}
      />
    </Box>
  );
};

export default FriendBalance;