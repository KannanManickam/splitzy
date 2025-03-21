import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Divider,
  Chip,
  Avatar,
  CircularProgress,
  IconButton,
  MenuItem,
  Menu,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { settlementService, Settlement } from '../../services/settlement';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type SortOrder = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

interface SettlementHistoryProps {
  friendId?: string;
  groupId?: string;
  filterType?: 'paid' | 'received';
  onDelete?: () => void;
}

const SettlementHistory: React.FC<SettlementHistoryProps> = ({ 
  friendId, 
  groupId, 
  filterType, 
  onDelete 
}) => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [filteredSettlements, setFilteredSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');
  
  // For the options menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    fetchSettlements();
  }, [friendId, groupId, filterType]);

  useEffect(() => {
    filterAndSortSettlements();
  }, [settlements, searchTerm, sortOrder]);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      if (friendId) {
        const response = await settlementService.getSettlementsWithFriend(friendId);
        data = response.settlements;
      } else if (groupId) {
        data = await settlementService.getGroupSettlements(groupId);
      } else {
        data = await settlementService.getUserSettlements();
      }
      
      // Apply filtering if filterType is specified
      if (filterType && user) {
        if (filterType === 'paid') {
          data = data.filter(settlement => settlement.payer.id === user.id);
        } else if (filterType === 'received') {
          data = data.filter(settlement => settlement.receiver.id === user.id);
        }
      }
      
      setSettlements(data);
    } catch (err: any) {
      console.error('Error fetching settlements:', err);
      setError('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSettlements = () => {
    let filtered = [...settlements];

    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(settlement => 
        settlement.payer.name.toLowerCase().includes(query) ||
        settlement.receiver.name.toLowerCase().includes(query) ||
        (settlement.notes && settlement.notes.toLowerCase().includes(query))
      );
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

    setFilteredSettlements(filtered);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, settlementId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSettlementId(settlementId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    if (!selectedSettlementId) {
      setDeleteError('No settlement selected for deletion');
      return;
    }
    setAnchorEl(null); // Just close the menu but keep the selectedSettlementId
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedSettlementId) {
      setDeleteError('No settlement selected for deletion');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await settlementService.deleteSettlement(selectedSettlementId);
      setSettlements(prev => prev.filter(s => s.id !== selectedSettlementId));
      setFilteredSettlements(prev => prev.filter(s => s.id !== selectedSettlementId));
      setShowDeleteConfirm(false);
      setSelectedSettlementId(null); // Clear ID only after successful deletion
      if (onDelete) onDelete();
    } catch (err) {
      console.error('Error deleting settlement:', err);
      setDeleteError('Failed to delete settlement. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
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
            placeholder="Search settlements..."
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
          {filteredSettlements.length} {filteredSettlements.length === 1 ? 'settlement' : 'settlements'} found
        </Typography>
      </Paper>

      {/* Settlements List */}
      {filteredSettlements.length > 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <List disablePadding>
            {filteredSettlements.map((settlement, index) => {
              const isUserPayer = settlement.payer.id === user?.id;
              const otherParty = isUserPayer ? settlement.receiver : settlement.payer;
              
              return (
                <React.Fragment key={settlement.id}>
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
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                      <Avatar
                        sx={{
                          bgcolor: isUserPayer ? 'error.main' : 'success.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        {otherParty.name[0]}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {isUserPayer ? (
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                You <ArrowForwardIcon sx={{ fontSize: 16 }} /> {otherParty.name}
                              </Box>
                            ) : (
                              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                {otherParty.name} <ArrowForwardIcon sx={{ fontSize: 16 }} /> You
                              </Box>
                            )}
                          </Typography>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            color={isUserPayer ? 'error.main' : 'success.main'}
                          >
                            {isUserPayer ? '-' : '+'} ${Number(settlement.amount).toFixed(2)}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(settlement.date).fromNow()}
                          </Typography>
                          
                          {settlement.group && (
                            <>
                              <Typography variant="body2" color="text.secondary">•</Typography>
                              <Chip 
                                label={settlement.group.name} 
                                size="small" 
                                sx={{ height: 20 }} 
                              />
                            </>
                          )}
                        </Stack>
                        
                        {settlement.notes && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mt: 0.5,
                              fontStyle: 'italic'
                            }}
                          >
                            "{settlement.notes}"
                          </Typography>
                        )}
                      </Box>

                      <IconButton 
                        edge="end" 
                        onClick={(e) => handleMenuClick(e, settlement.id)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                </React.Fragment>
              );
            })}
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
          <Typography variant="h6" gutterBottom>
            No Settlements Found
          </Typography>
          <Typography color="text.secondary">
            {searchTerm
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'No settlements have been recorded yet.'}
          </Typography>
        </Paper>
      )}

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={handleDeleteClick}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Settlement</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete this settlement? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteConfirm(false)} 
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettlementHistory;