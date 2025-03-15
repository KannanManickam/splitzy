import React, { useState, useEffect } from 'react';
import { expenseService, Expense } from '../../services/expense';
import ExpenseForm from './ExpenseForm';
import type { ExpenseFormData } from './ExpenseForm';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface ExtendedExpenseFormData extends ExpenseFormData {
  id?: string;
}

const ExpenseList: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExtendedExpenseFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        handleCloseSnackbar();
      }, 4000); // Close after 4 seconds
      
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const loadExpenses = async () => {
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
    }
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expenseId: string) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (expense) {
      // Format the date to YYYY-MM-DD as required by the date input field
      const formattedDate = formatDateForInput(expense.date);
      
      setSelectedExpense({
        id: expense.id,
        description: expense.description,
        amount: expense.amount.toString(),
        date: formattedDate,
        paidBy: expense.paidBy.id,
        splitBetween: expense.splitBetween.map(user => user.id),
      });
      setIsEditing(true);
      setIsFormOpen(true);
    }
  };

  // Helper to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Return today's date if the date is invalid
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const handleFormSubmit = async (formData: ExpenseFormData) => {
    try {
      if (isEditing && selectedExpense && selectedExpense.id) {
        const updated = await expenseService.updateExpense(selectedExpense.id, {
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: formData.date,
          paidBy: formData.paidBy,
          splitBetween: formData.splitBetween,
        });
        setExpenses(expenses.map(exp => exp.id === updated.id ? updated : exp));
        setIsFormOpen(false);
        showNotification('Expense updated successfully', 'success');
      } else {
        const created = await expenseService.createExpense({
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: formData.date,
          paidBy: formData.paidBy,
          splitBetween: formData.splitBetween,
        });
        setExpenses(prev => [...prev, created]);
        setIsFormOpen(false);
        showNotification('Expense added successfully', 'success');
      }
    } catch (error: any) {
      console.error('Error saving expense:', error);
      showNotification(
        error.response?.data?.message || 'Failed to save expense',
        'error'
      );
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await expenseService.deleteExpense(expenseId);
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
      showNotification('Expense deleted successfully', 'success');
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete expense';
      showNotification(errorMsg, 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      mx: -3, 
      mt: -3,  // Remove top padding/margin
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 0, // Reduce the bottom margin
        px: 3,
        py: 1 // Use padding for both top and bottom
      }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddExpense}
          size="large"
          sx={{ px: 3, py: 1 }}
        >
          Add Expense
        </Button>
      </Box>
      
      {expenses.length > 0 ? (
        <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 0, mt: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Paid By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Split Between</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} sx={{ 
                  '&:hover': { 
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  },
                  transition: 'background-color 0.2s ease'
                }}>
                  <TableCell sx={{ maxWidth: 300, wordBreak: 'break-word' }}>
                    <Typography fontWeight={500}>{expense.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color="primary.main" fontSize="1.1rem">
                      ${Number(expense.amount).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography>{formatDate(expense.date)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'success.main', fontSize: '0.8rem' }}>
                        {expense.paidBy.name.charAt(0)}
                      </Avatar>
                      <Typography>{expense.paidBy.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {expense.splitBetween.map((user) => (
                        <Chip
                          key={user.id}
                          label={user.name}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {/* Show edit button to everyone but disable if not creator */}
                      <Tooltip title={expense.paidBy.id === user?.id ? "Edit expense" : "Only expense creator can edit"}>
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditExpense(expense.id)}
                            color="primary"
                            disabled={expense.paidBy.id !== user?.id}
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider',
                              opacity: expense.paidBy.id === user?.id ? 1 : 0.5
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      {/* Show delete button to everyone but disable if not creator */}
                      <Tooltip title={expense.paidBy.id === user?.id ? "Delete expense" : "Only expense creator can delete"}>
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteExpense(expense.id)} 
                            color="error"
                            disabled={expense.paidBy.id !== user?.id}
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider',
                              opacity: expense.paidBy.id === user?.id ? 1 : 0.5
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
          }}
        >
          <AccountBalanceWalletIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No Expenses Found</Typography>
          <Typography color="text.secondary" paragraph>
            You haven't added any expenses yet. Click the button above to add your first expense.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddExpense}
          >
            Add Your First Expense
          </Button>
        </Paper>
      )}

      <ExpenseForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedExpense(null);
          setIsEditing(false);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedExpense || undefined}
        isEditing={isEditing}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExpenseList;