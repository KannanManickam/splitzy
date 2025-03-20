import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Avatar,
  Chip,
  Button,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupExpenseList from './GroupExpenseList';
import GroupBalances from './GroupBalances';
import { groupService } from '../../services/group';
import { useAuth } from '../../contexts/AuthContext';
import LoadingState from '../LoadingState';
import { GroupExpense, GroupBalance, GroupSettlement, groupExpenseService } from '../../services/groupExpense';
import GroupExpenseForm from './GroupExpenseForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  category: string;
  created_by: string;
  memberCount: number;
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

interface IGroupExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  createdBy: {
    id: string;
    name: string;
  };
  paidBy: {
    id: string;
    name: string;
  };
  shares: Array<{
    id: string;
    user_id: string;
    expense_id: string;
    amount: number;
    user: {
      id: string;
      name: string;
      email: string;
    }
  }>;
}

// Add type for raw API response
interface RawGroupExpense extends Omit<GroupExpense, 'createdBy' | 'paidBy'> {
  creator?: {
    id: string;
    name: string;
  };
  payer?: {
    id: string;
    name: string;
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const GroupDetails: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<IGroupExpense[]>([]);
  const [balances, setBalances] = useState<GroupBalance[]>([]);
  const [settlements, setSettlements] = useState<GroupSettlement[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [hasUnsettledBalances, setHasUnsettledBalances] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IGroupExpense | null>(null);

  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const normalizeExpense = (expense: RawGroupExpense): IGroupExpense => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    createdBy: {
      id: expense.creator?.id || '',
      name: expense.creator?.name || 'Unknown'
    },
    paidBy: {
      id: expense.payer?.id || '',
      name: expense.payer?.name || 'Unknown'
    },
    shares: Array.isArray(expense.shares) ? expense.shares.map(share => ({
      id: share.id || '',
      user_id: share.user_id || share.user?.id || '',
      expense_id: share.expense_id || expense.id,
      amount: Number(share.amount || 0),
      user: {
        id: share.user?.id || share.user_id || '',
        name: share.user?.name || 'Unknown',
        email: share.user?.email || ''
      }
    })) : []
  });

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const groupData = await groupService.getGroupDetails(groupId!);
      setGroup(groupData);
      const [rawExpenses, balances, settlements] = await Promise.all([
        groupExpenseService.getGroupExpenses(groupId!),
        groupExpenseService.getGroupBalances(groupId!),
        groupExpenseService.getGroupSettlementSuggestions(groupId!)
      ]);
      
      // Normalize expense data to match expected interface
      const normalizedExpenses = rawExpenses.map(normalizeExpense);
      
      console.log('Original expenses:', rawExpenses);
      console.log('Normalized expenses:', normalizedExpenses);
      
      setExpenses(normalizedExpenses);
      setBalances(balances);
      setSettlements(settlements);
      setHasUnsettledBalances(checkUnsettledBalances(balances));
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupExpenses = async () => {
    try {
      const rawExpenses = await groupExpenseService.getGroupExpenses(groupId!);
      const normalizedExpenses = rawExpenses.map(normalizeExpense);
      setExpenses(normalizedExpenses);
    } catch (error) {
      console.error('Error fetching group expenses:', error);
    }
  };

  const fetchBalancesAndSettlements = async () => {
    try {
      const [balances, settlements] = await Promise.all([
        groupExpenseService.getGroupBalances(groupId!),
        groupExpenseService.getGroupSettlementSuggestions(groupId!)
      ]);
      
      setBalances(balances);
      setSettlements(settlements);
      setHasUnsettledBalances(checkUnsettledBalances(balances));
    } catch (error) {
      console.error('Error fetching balances and settlements:', error);
    }
  };

  const handleSettlementSuccess = async () => {
    // First wait a short moment to allow the backend to process the settlement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Then refresh all the data
    await fetchBalancesAndSettlements();
  };

  const checkUnsettledBalances = (balances: any[]) => {
    return balances.some(balance => Math.abs(balance.amount) > 0.01);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleEditExpense = (expense: IGroupExpense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (expense: IGroupExpense) => {
    try {
      await groupExpenseService.deleteGroupExpense(groupId!, expense.id);
      await fetchGroupExpenses();
      await fetchBalancesAndSettlements();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleSubmitExpense = async (expenseData: any) => {
    try {
      if (editingExpense) {
        await groupExpenseService.updateGroupExpense(groupId!, editingExpense.id, expenseData);
      } else {
        await groupExpenseService.createGroupExpense(groupId!, expenseData);
      }
      handleCloseExpenseForm();
      await fetchGroupExpenses();
      await fetchBalancesAndSettlements();
    } catch (error) {
      console.error('Error handling expense:', error);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleContinueSettling = async () => {
    try {
      // Get fresh settlement suggestions
      const newSettlements = await groupExpenseService.getGroupSettlementSuggestions(groupId!);
      setSettlements(newSettlements);
      
      // Get updated balances
      const newBalances = await groupExpenseService.getGroupBalances(groupId!);
      setBalances(newBalances);
      
      // Check if we still have unsettled balances
      setHasUnsettledBalances(checkUnsettledBalances(newBalances));
    } catch (error) {
      console.error('Error continuing settlement:', error);
    }
  };

  if (loading) {
    return <LoadingState type="pulse" message="Loading group details..." height="400px" />;
  }

  if (!group) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Group not found</Typography>
        <Button onClick={() => navigate('/groups')} startIcon={<ArrowBackIcon />}>
          Back to Groups
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ mx: -3, mt: -3 }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        mb: 3
      }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={() => navigate('/groups')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight={600}>
              {group.name}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setShowExpenseForm(true)}
              >
                Add Expense
              </Button>
              {group.created_by === user?.id && (
                <IconButton onClick={() => {/* Handle edit */}}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              icon={<GroupIcon />}
              label={group.category}
              color="primary"
              variant="outlined"
            />
            <Typography color="text.secondary">
              Members ({group.members.length})
            </Typography>
          </Box>
          
          {group.description && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {group.description}
            </Typography>
          )}
        </Box>

        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{
            px: 3,
            '& .MuiTab-root': {
              minHeight: 48,
              py: 2
            }
          }}
        >
          <Tab 
            icon={<ReceiptLongIcon />} 
            label="Expenses" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<PaymentIcon />} 
            label="Balances" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<GroupIcon />} 
            label="Members" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ position: 'relative', minHeight: '200px' }}>
          <GroupExpenseList 
            expenses={expenses}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddExpense={handleAddExpense}
          />
        </Box>
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <GroupBalances 
          balances={balances}
          settlements={settlements}
          groupId={groupId || ''}
          onSettlementSuccess={handleSettlementSuccess}
        />
        {hasUnsettledBalances && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography color="warning.main">
              There are still unsettled balances. Continue to settle the remaining debts?
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinueSettling}
              sx={{ mt: 1 }}
            >
              Continue Settling
            </Button>
          </Box>
        )}
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {group.members.map((member: any) => (
            <Chip
              key={member.id}
              avatar={<Avatar>{member.name[0]}</Avatar>}
              label={member.name}
              variant="outlined"
              sx={{ p: 1 }}
            />
          ))}
        </Box>
      </TabPanel>

      {showExpenseForm && (
        <GroupExpenseForm
          open={showExpenseForm}
          onClose={handleCloseExpenseForm}
          onSubmit={handleSubmitExpense}
          groupMembers={group.members || []}
          initialData={editingExpense ? {
            description: editingExpense.description,
            amount: editingExpense.amount.toString(),
            date: editingExpense.date,
            paidBy: editingExpense.paidBy.id,
            split_between: editingExpense.shares?.map(share => share.user.id) || []
          } : undefined}
          isEditing={!!editingExpense}
        />
      )}
    </Box>
  );
};

export default GroupDetails;