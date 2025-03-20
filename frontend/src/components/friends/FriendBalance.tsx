import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, Button, Tabs, Tab } from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
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
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: isNetPositive ? 'success.main' : isNetNegative ? 'error.main' : 'text.primary' }}>
              {isNetPositive ? `${friendName} owes you $${netBalance.toFixed(2)}` :
               isNetNegative ? `You owe ${friendName} $${Math.abs(netBalance).toFixed(2)}` :
               `You are settled up with ${friendName}`}
            </Typography>
            
            {(isNetPositive || isNetNegative) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<WalletIcon />}
                onClick={() => setShowSettlementForm(true)}
                sx={{ 
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }
                }}
              >
                {isNetPositive ? 'Record Payment' : 'Settle Up'}
              </Button>
            )}
          </Box>

          {hasSettlements && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Expenses only: ${settledBalanceDetails.originalBalance.toFixed(2)} • Settlements impact: ${settledBalanceDetails.settlementBalance.toFixed(2)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="balance tabs">
          <Tab label="Expenses" />
          <Tab label="Settlements" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Expense History
        </Typography>
        
        <List sx={{ width: '100%' }}>
          {expenseHistory.length > 0 ? (
            expenseHistory.map((expense) => (
              <React.Fragment key={expense.id}>
                <Card variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ padding: 2, '&:last-child': { paddingBottom: 2 } }}>
                    <ListItem disablePadding>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {expense.description}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(expense.date)} • Paid by {expense.paidBy}
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 'medium',
                                color: expense.type === 'youPaid' ? 'success.main' : 'error.main'
                              }}
                            >
                              {expense.type === 'youPaid' 
                                ? `You paid $${expense.totalAmount.toFixed(2)}, ${friendName} owes $${expense.friendOwes?.toFixed(2)}` 
                                : `${friendName} paid $${expense.totalAmount.toFixed(2)}, you owe $${expense.youOwe?.toFixed(2)}`
                              }
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body1" sx={{ pt: 2, pb: 2 }}>
              No expenses found with this friend.
            </Typography>
          )}
        </List>
      </TabPanel>
      
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
        isRecordingPayment={isNetPositive} // Pass true when friend owes money (positive balance)
      />
    </Box>
  );
};

export default FriendBalance;