import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import { Group } from '../../services/group';
import { useAuth } from '../../contexts/AuthContext';

interface GroupDetailsProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  group: Group;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({
  open,
  onClose,
  onEdit,
  group
}) => {
  const theme = useTheme();
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {group.name}
          </Typography>
          <Chip 
            label={group.category}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={onEdit}
            size="small"
            color="primary"
            disabled={group.created_by !== user?.id}
            sx={{
              border: '1px solid',
              borderColor: 'primary.main',
              opacity: group.created_by === user?.id ? 1 : 0.5,
              '&:hover': { 
                bgcolor: 'primary.lighter'
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { 
                bgcolor: 'error.lighter',
                color: 'error.main'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Members
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {group.memberCount} {group.memberCount === 1 ? 'Member' : 'Members'}
                </Typography>
              </Box>
              {group.members.map((member) => (
                <Chip
                  key={member.id}
                  label={member.id === user?.id ? `${user.name} (You)` : member.name}
                  size="small"
                  avatar={
                    <Avatar sx={{ 
                      bgcolor: member.id === user?.id ? 'primary.main' : 'secondary.main' 
                    }}>
                      {member.name[0]}
                    </Avatar>
                  }
                  sx={{
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Group Balance
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
              ${group.totalBalance.toFixed(2)}
            </Typography>
          </Box>

          {group.expenses && group.expenses.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recent Expenses
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Paid By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <Typography color="primary.main" fontWeight={500}>
                            ${expense.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={expense.paidBy.id === user?.id ? `${user.name} (You)` : expense.paidBy.name}
                            avatar={
                              <Avatar sx={{ 
                                bgcolor: expense.paidBy.id === user?.id ? 'primary.main' : 'secondary.main' 
                              }}>
                                {expense.paidBy.name[0]}
                              </Avatar>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.default'
              }}
            >
              <Typography color="text.secondary">
                No expenses in this group yet
              </Typography>
            </Paper>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetails;