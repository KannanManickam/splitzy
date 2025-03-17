import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { GroupExpense } from '../../services/groupExpense';
import { useAuth } from '../../contexts/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';

interface GroupExpenseListProps {
  expenses: GroupExpense[];
  onEditExpense?: (expense: GroupExpense) => void;
  onDeleteExpense?: (expense: GroupExpense) => void;
  onAddExpense?: () => void;
}

const GroupExpenseList: React.FC<GroupExpenseListProps> = ({ 
  expenses, 
  onEditExpense, 
  onDeleteExpense,
  onAddExpense 
}) => {
  const { user } = useAuth();
  const [expenseToDelete, setExpenseToDelete] = useState<GroupExpense | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Debug: Log expenses to see their structure
  useEffect(() => {
    console.log('GroupExpenseList - expenses received:', expenses);
    if (expenses.length > 0) {
      console.log('First expense shares:', expenses[0].shares);
    }
  }, [expenses]);

  const handleEdit = (expense: GroupExpense) => {
    if (onEditExpense) {
      onEditExpense(expense);
    }
  };

  const handleDeleteClick = (expense: GroupExpense) => {
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDeleteExpense && expenseToDelete) {
      onDeleteExpense(expenseToDelete);
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    }
  };
  
  // Safety function to handle possible undefined shares
  const renderShareName = (share: any) => {
    if (!share) return 'Unknown';
    if (share.user && share.user.name) return share.user.name;
    if (share.name) return share.name;
    return 'Unknown';
  };
  
  return (
    <>
      {expenses.length > 0 ? (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Paid By</TableCell>
                <TableCell>Split Between</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    ${Number(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'info.main', fontSize: '0.8rem' }}>
                        {expense.createdBy.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{expense.createdBy.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main', fontSize: '0.8rem' }}>
                        {expense.paidBy.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{expense.paidBy.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {expense.shares && expense.shares.map((share) => (
                        <Chip
                          key={share.id || `share-${Math.random()}`}
                          label={`${renderShareName(share)} ($${Number(share.amount).toFixed(2)})`}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title={expense.createdBy.id === user?.id ? "Edit expense" : "Only creator can edit"}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(expense)}
                            color="primary"
                            disabled={expense.createdBy.id !== user?.id}
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider',
                              opacity: expense.createdBy.id === user?.id ? 1 : 0.5
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={expense.createdBy.id === user?.id ? "Delete expense" : "Only creator can delete"}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(expense)}
                            color="error"
                            disabled={expense.createdBy.id !== user?.id}
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider',
                              opacity: expense.createdBy.id === user?.id ? 1 : 0.5
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            mt: 2
          }}
        >
          <AccountBalanceWalletIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No Group Expenses Yet</Typography>
          <Typography color="text.secondary" paragraph>
            This group doesn't have any expenses yet. Click below to add your first expense and start tracking group spending.
          </Typography>
          {onAddExpense && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddExpense}
              sx={{ mt: 2 }}
            >
              Add First Group Expense
            </Button>
          )}
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Group Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this group expense? This action cannot be undone and will affect all group members' balances.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupExpenseList;