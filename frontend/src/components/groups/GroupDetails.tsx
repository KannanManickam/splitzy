import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Avatar,
  AvatarGroup,
  Button,
  Tooltip,
  Stack,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import GroupExpenseList from './GroupExpenseList';
import GroupBalances from './GroupBalances';
import GroupExpenseForm from './GroupExpenseForm';
import GroupForm from './GroupForm';
import SettlementHistory from '../settlements/SettlementHistory';
import { groupService, Group } from '../../services/group';
import { groupExpenseService, GroupExpense, GroupBalance } from '../../services/groupExpense';
import { CreateGroupExpenseData } from '../../services/groupExpense';
import { GroupExpenseFormData } from './GroupExpenseForm';

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
      id={`group-tabpanel-${index}`}
      aria-labelledby={`group-tab-${index}`}
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

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [balances, setBalances] = useState<GroupBalance[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<GroupExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      const groupData = await groupService.getGroupDetails(groupId);
      setGroup(groupData);
      const expenses = await groupExpenseService.getGroupExpenses(groupId);
      setExpenses(expenses);
      const balances = await groupExpenseService.getGroupBalances(groupId);
      setBalances(balances);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching group details:', err);
      setError('Failed to load group details');
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense: GroupExpense) => {
    setSelectedExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (expense: GroupExpense) => {
    if (!groupId) return;
    
    try {
      await groupExpenseService.deleteGroupExpense(groupId, expense.id);
      setSuccessMessage('Expense deleted successfully');
      fetchGroupDetails();
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  const handleExpenseSubmit = async (formData: GroupExpenseFormData) => {
    if (!groupId) return;
    
    try {
      const expenseData: CreateGroupExpenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        paid_by: formData.paidBy,
        split_between: formData.split_between,
        group_id: groupId
      };

      if (selectedExpense) {
        await groupExpenseService.updateGroupExpense(groupId, selectedExpense.id, expenseData);
      } else {
        await groupExpenseService.createGroupExpense(groupId, expenseData);
      }

      setSuccessMessage('Expense saved successfully');
      setShowExpenseForm(false);
      fetchGroupDetails();
    } catch (err) {
      setError('Failed to save expense');
      console.error(err);
    }
  };

  const handleGroupUpdate = async (groupData: any) => {
    if (!groupId) return;
    
    try {
      await groupService.updateGroup(groupId, groupData);
      setSuccessMessage('Group updated successfully');
      setShowEditForm(false);
      fetchGroupDetails();
    } catch (err) {
      setError('Failed to update group');
      console.error(err);
    }
  };

  const handleSettlementSuccess = () => {
    setSuccessMessage('Settlement recorded successfully');
    fetchGroupDetails();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          {/* Add your loading component here */}
        </Box>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Group not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Navigation */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/groups')}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            <ArrowBackIcon fontSize="small" />
            Back to Groups
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 500 }}>
            {group.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Group Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          mb: 3,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              {group.name}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {group.description}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <AvatarGroup 
                max={4}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem',
                    border: '2px solid',
                    borderColor: 'background.paper'
                  }
                }}
              >
                {group.members.map((member: any) => (
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
              <Typography variant="body2" color="text.secondary">
                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
              </Typography>
            </Stack>
          </Box>

          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setShowEditForm(true)}
          >
            Edit Group
          </Button>
        </Box>
      </Paper>

      {/* Tabs Navigation */}
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 56,
              fontWeight: 500
            }
          }}
        >
          <Tab 
            icon={<ReceiptIcon />} 
            label="Expenses" 
            iconPosition="start"
          />
          <Tab 
            icon={<AccountBalanceIcon />} 
            label="Balances" 
            iconPosition="start"
          />
          <Tab 
            icon={<HistoryIcon />} 
            label="History" 
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <GroupExpenseList
            expenses={expenses}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddExpense={handleAddExpense}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <GroupBalances
            balances={balances}
            groupId={groupId || ''}
            onSettlementSuccess={handleSettlementSuccess}
            settlements={[]} // Pass empty array since it's required by the component
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <SettlementHistory
            groupId={groupId || ''}
          />
        </TabPanel>
      </Paper>

      {/* Forms */}
      {showExpenseForm && (
        <GroupExpenseForm
          open={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          onSubmit={handleExpenseSubmit}
          groupMembers={group?.members || []}
          initialData={selectedExpense ? {
            description: selectedExpense.description,
            amount: selectedExpense.amount.toString(),
            date: selectedExpense.date,
            paidBy: selectedExpense.paidBy.id,
            split_between: selectedExpense.shares.map(s => s.user_id)
          } : undefined}
          isEditing={!!selectedExpense}
        />
      )}

      {showEditForm && (
        <GroupForm
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSubmit={handleGroupUpdate}
          initialData={group}
          isEditing={true}
        />
      )}
    </Container>
  );
};

export default GroupDetails;