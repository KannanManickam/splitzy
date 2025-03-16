import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Chip,
  Paper,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import GroupForm from './GroupForm';
import GroupDetails from './GroupDetails';
import { groupService, Group } from '../../services/group';
import { useAuth } from '../../contexts/AuthContext';
import LoadingState from '../LoadingState';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
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
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      showNotification('Failed to load groups', 'error');
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleAddGroup = async (groupData: any) => {
    try {
      const newGroup = await groupService.createGroup(groupData);
      setGroups([...groups, newGroup]);
      setIsFormOpen(false);
      showNotification('Group created successfully', 'success');
    } catch (error) {
      console.error('Error adding group:', error);
      showNotification('Failed to create group', 'error');
    }
  };

  const handleEditGroup = async (groupData: any) => {
    try {
      if (!selectedGroup) return;
      const updatedGroup = await groupService.updateGroup(selectedGroup, groupData);
      setGroups(groups.map(group => group.id === selectedGroup ? updatedGroup : group));
      setSelectedGroup(null);
      setIsFormOpen(false);
      showNotification('Group updated successfully', 'success');
    } catch (error) {
      console.error('Error editing group:', error);
      showNotification('Failed to update group', 'error');
    }
  };

  const handleDeleteClick = (groupId: string) => {
    setGroupToDelete(groupId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    try {
      await groupService.deleteGroup(groupToDelete);
      setGroups(groups.filter(group => group.id !== groupToDelete));
      setDeleteConfirmOpen(false);
      setGroupToDelete(null);
      showNotification('Group deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting group:', error);
      showNotification('Failed to delete group', 'error');
    }
  };

  const handleOpenDetails = (groupId: string) => {
    setSelectedGroup(groupId);
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

  return (
    <Box sx={{ mx: -3, mt: -3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 0,
        px: 3,
        py: 1
      }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Groups
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setIsFormOpen(true);
            setIsEditing(false);
          }}
          size="large"
          sx={{ px: 3, py: 1 }}
        >
          Add Group
        </Button>
      </Box>

      {loading ? (
        <LoadingState type="pulse" message="Loading groups..." height="400px" />
      ) : groups.length > 0 ? (
        <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 0, mt: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Members</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group) => (
                <TableRow 
                  key={group.id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 32,
                          height: 32
                        }}
                      >
                        <GroupIcon fontSize="small" />
                      </Avatar>
                      <Typography fontWeight={500}>{group.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<CategoryIcon />}
                      label={group.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AvatarGroup 
                        max={3}
                        sx={{
                          '& .MuiAvatar-root': {
                            width: 28,
                            height: 28,
                            fontSize: '0.875rem',
                            bgcolor: 'secondary.main'
                          }
                        }}
                      >
                        {group.members.map((member) => (
                          <Tooltip key={member.id} title={member.name}>
                            <Avatar 
                              sx={{ 
                                bgcolor: member.id === user?.id ? 'primary.main' : 'secondary.main'
                              }}
                            >
                              {member.name[0]}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                      <Typography color="text.secondary" variant="body2">
                        {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalanceIcon color="primary" fontSize="small" />
                      <Typography fontWeight={600} color="primary">
                        ${group.totalBalance.toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetails(group.id)}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={group.created_by === user?.id ? "Edit Group" : "Only group creator can edit"}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => {
                              // Don't set selectedGroup when directly editing
                              setIsEditing(true);
                              setIsFormOpen(true);
                              setSelectedGroup(group.id);
                            }}
                            color="primary"
                            disabled={group.created_by !== user?.id}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              opacity: group.created_by === user?.id ? 1 : 0.5
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={group.created_by === user?.id ? "Delete Group" : "Only group creator can delete"}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(group.id)}
                            color="error"
                            disabled={group.created_by !== user?.id}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              opacity: group.created_by === user?.id ? 1 : 0.5
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
            mx: 3,
            mt: 3
          }}
        >
          <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No Groups Found</Typography>
          <Typography color="text.secondary" paragraph>
            You haven't created any groups yet. Click the button above to create your first group.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setIsFormOpen(true);
              setIsEditing(false);
            }}
          >
            Create Your First Group
          </Button>
        </Paper>
      )}

      <GroupForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedGroup(null);
          setIsEditing(false);
        }}
        onSubmit={isEditing ? handleEditGroup : handleAddGroup}
        initialData={isEditing && selectedGroup ? 
          groups.find(g => g.id === selectedGroup) : undefined}
        isEditing={isEditing}
      />

      {/* Only show GroupDetails when not editing */}
      {selectedGroup && !isEditing && (
        <GroupDetails
          open={Boolean(selectedGroup && !isEditing)}
          onClose={() => setSelectedGroup(null)}
          onEdit={() => {
            setIsEditing(true);
            setIsFormOpen(true);
          }}
          group={groups.find(g => g.id === selectedGroup)!}
        />
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this group? This action cannot be undone and will also delete all associated expenses.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default Groups;