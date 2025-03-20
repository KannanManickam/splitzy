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
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { settlementService, Settlement } from '../../services/settlement';
import { useAuth } from '../../contexts/AuthContext';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

interface SettlementHistoryProps {
  friendId?: string;
  groupId?: string;
  filterType?: 'paid' | 'received';
  onDelete?: () => void;
}

const SettlementHistory: React.FC<SettlementHistoryProps> = ({ friendId, groupId, filterType, onDelete }) => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // For the options menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Fetch settlements based on props
  useEffect(() => {
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
    
    fetchSettlements();
  }, [friendId, groupId, filterType, user]);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, settlementId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSettlementId(settlementId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    // Don't clear selectedSettlementId here, we need it for the deletion
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSettlementId) {
      setDeleteError('No settlement selected for deletion');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await settlementService.deleteSettlement(selectedSettlementId);
      setSettlements(prev => prev.filter(s => s.id !== selectedSettlementId));
      setShowDeleteConfirm(false);
      setSelectedSettlementId(null); // Clear the ID after successful deletion
      if (onDelete) {
        onDelete();
      }
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
  
  if (settlements.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No settlements found {
            friendId ? 'with this friend' : 
            groupId ? 'in this group' : 
            filterType === 'paid' ? 'that you paid' :
            filterType === 'received' ? 'that you received' : 
            ''
          }
        </Typography>
      </Box>
    );
  }
  
  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            px: 2,
            py: 2,
            bgcolor: 'background.default',
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 600
          }}
        >
          Settlement History
        </Typography>
        
        <List disablePadding>
          {settlements.map((settlement, index) => {
            const isUserPayer = settlement.payer.id === user?.id;
            const otherParty = isUserPayer ? settlement.receiver : settlement.payer;
            
            return (
              <React.Fragment key={settlement.id}>
                {index > 0 && <Divider />}
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={(e) => handleMenuClick(e, settlement.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  }
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 2,
                      width: '100%' 
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: isUserPayer ? 'primary.main' : 'secondary.main',
                        width: 40,
                        height: 40
                      }}
                    >
                      {isUserPayer ? user?.name[0] : otherParty.name[0]}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body1" fontWeight={500}>
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
                          variant="body2" 
                          fontWeight={500} 
                          color={isUserPayer ? 'error.main' : 'success.main'} 
                          sx={{ ml: 2 }}
                        >
                          {isUserPayer ? '-' : '+'} ${Number(settlement.amount).toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(settlement.date)}
                        </Typography>
                        
                        {settlement.group && (
                          <>
                            <Typography variant="body2" color="text.secondary">•</Typography>
                            <Chip 
                              label={settlement.group.name} 
                              size="small" 
                              sx={{ height: 20, fontSize: '0.75rem' }} 
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
                  </Box>
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
      
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