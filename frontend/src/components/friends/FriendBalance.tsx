import React from 'react';
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText } from '@mui/material';
import { getBalanceWithFriend, ExpenseHistoryItem } from '../../services/balance';
import { formatDate } from '../../utils/dateUtils';

interface FriendBalanceProps {
  friendId: string;
  friendName: string;
}

const FriendBalance: React.FC<FriendBalanceProps> = ({ friendId, friendName }) => {
  const [balanceDetails, setBalanceDetails] = React.useState<{
    balance: number;
    expenseHistory: ExpenseHistoryItem[];
  } | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBalanceDetails = async () => {
      try {
        setLoading(true);
        const data = await getBalanceWithFriend(friendId);
        setBalanceDetails(data);
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
  const isPositive = balance > 0;
  const isNegative = balance < 0;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Balance with {friendName}
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.primary' }}>
            {isPositive ? `${friendName} owes you $${balance.toFixed(2)}` :
             isNegative ? `You owe ${friendName} $${Math.abs(balance).toFixed(2)}` :
             `You are settled up with ${friendName}`}
          </Typography>
        </CardContent>
      </Card>

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
    </Box>
  );
};

export default FriendBalance;