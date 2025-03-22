import React, { useState, useEffect } from 'react';
import { expenseService, Expense } from '../../services/expense';
import ExpenseForm from './ExpenseForm';
import type { ExpenseFormData } from './ExpenseForm';
import { useAuth } from '../../contexts/AuthContext';
import LoadingState from '../LoadingState';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

interface ExtendedExpenseFormData extends ExpenseFormData {
  id?: string;
}

interface ExpenseListProps {
  isFormOpen: boolean;
  onFormClose: () => void;
}

type SortOrder = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

const ExpenseList: React.FC<ExpenseListProps> = ({ isFormOpen, onFormClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<ExtendedExpenseFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'group'>('all');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterAndSortExpenses();
  }, [expenses, searchTerm, sortOrder, filterType]);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        handleCloseSnackbar();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
      showNotification('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortExpenses = () => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.paidBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType === 'personal') {
      filtered = filtered.filter(expense => !expense.group);
    } else if (filterType === 'group') {
      filtered = filtered.filter(expense => expense.group);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    setFilteredExpenses(filtered);
  };

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

  const handleEditExpense = (expenseId: string) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (expense) {
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
      // Call the parent's onFormOpen handler by setting isFormOpen to true
      if (!isFormOpen) {
        onFormClose(); // This is actually toggling the form open in the parent
      }
    }
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? new Date().toISOString().split('T')[0]
      : date.toISOString().split('T')[0];
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
        onFormClose();
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
        onFormClose();
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

  const handleDeleteClick = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;

    try {
      await expenseService.deleteExpense(expenseToDelete);
      setExpenses(expenses.filter(exp => exp.id !== expenseToDelete));
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
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
    <Box>
      {/* Filters and Search */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ flex: 1 }}
        >
          <TextField
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filter By</InputLabel>
            <Select
              value={filterType}
              onChange={(e: SelectChangeEvent<'all' | 'personal' | 'group'>) => 
                setFilterType(e.target.value as 'all' | 'personal' | 'group')
              }
              label="Filter By"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Expenses</MenuItem>
              <MenuItem value="personal">Personal Only</MenuItem>
              <MenuItem value="group">Group Only</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e: SelectChangeEvent<SortOrder>) => 
                setSortOrder(e.target.value as SortOrder)
              }
              label="Sort By"
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="date_desc">Newest First</MenuItem>
              <MenuItem value="date_asc">Oldest First</MenuItem>
              <MenuItem value="amount_desc">Highest Amount</MenuItem>
              <MenuItem value="amount_asc">Lowest Amount</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Typography color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
          {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} found
        </Typography>
      </Paper>

      {loading ? (
        <LoadingState type="pulse" message="Loading expenses..." height="400px" />
      ) : filteredExpenses.length > 0 ? (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 2
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Paid By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Split Between</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Group</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow 
                  key={expense.id} 
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'action.hover'
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell sx={{ maxWidth: 300, wordBreak: 'break-word' }}>
                    <Typography fontWeight={500}>{expense.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      fontWeight={600} 
                      color="primary.main" 
                      fontSize="1.1rem"
                    >
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
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          bgcolor: 'info.main', 
                          fontSize: '0.8rem' 
                        }}
                      >
                        {expense.createdBy.name.charAt(0)}
                      </Avatar>
                      <Typography>{expense.createdBy.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          bgcolor: 'success.main', 
                          fontSize: '0.8rem' 
                        }}
                      >
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
                  <TableCell>
                    {expense.group ? (
                      <Chip
                        label={expense.group.name}
                        color="info"
                        variant="outlined"
                        onClick={() => navigate(`/groups/${expense.group?.id}`)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'info.lighter'
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Personal
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip 
                        title={
                          expense.createdBy.id === user?.id 
                            ? "Edit expense" 
                            : "Only expense creator can edit"
                        }
                      >
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditExpense(expense.id)}
                            color="primary"
                            disabled={expense.createdBy.id !== user?.id}
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider',
                              opacity: expense.createdBy.id === user?.id ? 1 : 0.5,
                              '&:hover': {
                                bgcolor: 'primary.lighter'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip 
                        title={
                          expense.createdBy.id === user?.id 
                            ? "Delete expense" 
                            : "Only creator can delete"
                        }
                      >
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(expense.id)}
                            color="error"
                            disabled={expense.createdBy.id !== user?.id}
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider',
                              opacity: expense.createdBy.id === user?.id ? 1 : 0.5,
                              '&:hover': {
                                bgcolor: 'error.lighter'
                              }
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
          <AccountBalanceWalletIcon 
            sx={{ 
              fontSize: 60, 
              color: 'text.secondary', 
              mb: 2 
            }}
          />
          <Typography variant="h5" gutterBottom>
            {searchTerm || filterType !== 'all' 
              ? 'No matching expenses found' 
              : 'No Expenses Yet'
            }
          </Typography>
          <Typography color="text.secondary" paragraph>
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'You haven\'t added any expenses yet. Click the button above to add your first expense.'
            }
          </Typography>
        </Paper>
      )}

      <ExpenseForm
        open={isFormOpen}
        onClose={() => {
          onFormClose();
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            color="inherit"
            sx={{
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{
              '&:hover': {
                bgcolor: 'error.dark'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseList;