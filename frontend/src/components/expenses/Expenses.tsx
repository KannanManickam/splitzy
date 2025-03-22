import React, { useState } from 'react';
import { 
  Container, 
  Box,
  Paper,
  Typography,
  Button,
  Tab,
  Tabs,
  useTheme,
  Divider,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpenseList from './ExpenseList';

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
      id={`expense-tabpanel-${index}`}
      aria-labelledby={`expense-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Expenses: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const toggleExpenseForm = () => {
    setIsExpenseFormOpen(!isExpenseFormOpen);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          position: 'relative',
          mb: 4
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            height: '140px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            mb: -8,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
              top: '-50%',
              left: '-50%',
              animation: 'rotate 60s linear infinite'
            }
          }}
        />
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            mx: { xs: 1, md: 2 },
            position: 'relative'
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Expenses
              </Typography>
              <Typography 
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Track and manage all your expenses in one place
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsExpenseFormOpen(true)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              Add Expense
            </Button>
          </Stack>

          <Divider />

          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              mt: 2,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 600
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              icon={<ReceiptLongIcon />} 
              iconPosition="start" 
              label="All Expenses" 
            />
            <Tab 
              icon={<GroupIcon />} 
              iconPosition="start" 
              label="Group Expenses" 
            />
            <Tab 
              icon={<TrendingUpIcon />} 
              iconPosition="start" 
              label="Analysis" 
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Content Sections */}
      <TabPanel value={currentTab} index={0}>
        <ExpenseList 
          isFormOpen={isExpenseFormOpen}
          onFormClose={toggleExpenseForm}
        />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            color: 'text.secondary',
            borderRadius: 2
          }}
        >
          <GroupIcon sx={{ fontSize: 48, mb: 2, color: 'action.active' }} />
          <Typography variant="h6" gutterBottom>
            Group Expenses
          </Typography>
          <Typography>
            View and manage your group-specific expenses here.
            Navigate to a specific group to see its expenses.
          </Typography>
        </Paper>
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            color: 'text.secondary',
            borderRadius: 2
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 48, mb: 2, color: 'action.active' }} />
          <Typography variant="h6" gutterBottom>
            Expense Analysis
          </Typography>
          <Typography>
            Detailed analysis and insights about your spending patterns.
            Coming soon!
          </Typography>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default Expenses;