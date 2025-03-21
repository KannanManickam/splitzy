import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { GroupExpense } from '../../services/groupExpense';
import DescriptionIcon from '@mui/icons-material/Description';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface GroupExpenseListProps {
  expenses: GroupExpense[];
  onEditExpense: (expense: GroupExpense) => void;
  onDeleteExpense: (expense: GroupExpense) => void;
  onAddExpense: () => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const GroupExpenseList: React.FC<GroupExpenseListProps> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
  onAddExpense,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterPaidBy, setFilterPaidBy] = useState<string>('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<GroupExpense | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Get unique payers for filter
  const uniquePayers = useMemo(() => {
    const payers = new Set(expenses.map(expense => expense.paidBy.id));
    return Array.from(payers);
  }, [expenses]);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(expense =>
        expense.description.toLowerCase().includes(query)
      );
    }

    // Apply paid by filter
    if (filterPaidBy !== 'all') {
      result = result.filter(expense => expense.paidBy.id === filterPaidBy);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [expenses, searchQuery, sortBy, filterPaidBy]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, expense: GroupExpense) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedExpense(null);
  };

  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedExpense) {
      onDeleteExpense(selectedExpense);
      setDeleteConfirmOpen(false);
      setSelectedExpense(null);
    }
  };

  return (
    <Box>
      {/* Filters and Actions */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ mb: 3 }}
        alignItems="center"
      >
        <TextField
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Paid By</InputLabel>
          <Select
            value={filterPaidBy}
            onChange={(e) => setFilterPaidBy(e.target.value)}
            label="Paid By"
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon sx={{ ml: 1 }} />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All Members</MenuItem>
            {uniquePayers.map(payerId => {
              const payer = expenses.find(e => e.paidBy.id === payerId)?.paidBy;
              if (!payer) return null;
              return (
                <MenuItem key={payerId} value={payerId}>
                  {payer.name} {payerId === user?.id ? '(You)' : ''}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={handleSortMenuOpen}
          startIcon={<SortIcon />}
        >
          Sort
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddExpense}
        >
          Add Expense
        </Button>
      </Stack>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchorEl}
        open={Boolean(sortMenuAnchorEl)}
        onClose={handleSortMenuClose}
      >
        <MenuItem 
          onClick={() => { setSortBy('date-desc'); handleSortMenuClose(); }}
          selected={sortBy === 'date-desc'}
        >
          Newest First
        </MenuItem>
        <MenuItem 
          onClick={() => { setSortBy('date-asc'); handleSortMenuClose(); }}
          selected={sortBy === 'date-asc'}
        >
          Oldest First
        </MenuItem>
        <MenuItem 
          onClick={() => { setSortBy('amount-desc'); handleSortMenuClose(); }}
          selected={sortBy === 'amount-desc'}
        >
          Highest Amount
        </MenuItem>
        <MenuItem 
          onClick={() => { setSortBy('amount-asc'); handleSortMenuClose(); }}
          selected={sortBy === 'amount-asc'}
        >
          Lowest Amount
        </MenuItem>
      </Menu>

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <List disablePadding>
            {filteredExpenses.map((expense, index) => (
              <React.Fragment key={expense.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.lighter',
                        color: 'primary.main'
                      }}
                    >
                      <DescriptionIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {expense.description}
                        </Typography>
                        <Chip
                          size="small"
                          label={dayjs(expense.date).fromNow()}
                          sx={{ 
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            height: 20
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          Paid by {expense.paidBy.name}
                          {expense.paidBy.id === user?.id && (
                            <Chip 
                              label="You"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Split between {expense.shares.length} people
                        </Typography>
                      </Stack>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: 'primary.main',
                        bgcolor: 'primary.lighter',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <MonetizationOnIcon fontSize="small" />
                      ${expense.amount.toFixed(2)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, expense)}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Expenses Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery
              ? "No expenses match your search criteria"
              : "This group doesn't have any expenses yet"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddExpense}
          >
            Add First Expense
          </Button>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            handleMenuClose();
            if (selectedExpense) onEditExpense(selectedExpense);
          }}
          sx={{
            color: 'primary.main',
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteClick}
          sx={{
            color: 'error.main',
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupExpenseList;