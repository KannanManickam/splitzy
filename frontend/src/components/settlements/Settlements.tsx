import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { settlementService } from '../../services/settlement';
import SettlementHistory from './SettlementHistory';
import SettlementForm from './SettlementForm';
import LoadingState from '../LoadingState';

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
      id={`settlements-tabpanel-${index}`}
      aria-labelledby={`settlements-tab-${index}`}
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

const Settlements: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showSettlementForm, setShowSettlementForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Just check if the API is accessible
        await settlementService.getUserSettlements();
        setError(null);
      } catch (err) {
        console.error('Error initializing settlements page:', err);
        setError('Failed to load settlements');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettlementSuccess = () => {
    // Update the refresh key to trigger a re-render of the SettlementHistory
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <LoadingState type="circular" message="Loading settlements..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6">{error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 4
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
          }}
        >
          Settlements
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowSettlementForm(true)}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            }
          }}
        >
          Record Settlement
        </Button>
      </Box>

      <Card 
        variant="outlined" 
        sx={{ 
          mb: 4,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WalletIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Settlement History</Typography>
            </Box>
            <TextField
              placeholder="Search settlements"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />
          </Box>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="settlement tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                },
                px: 2
              }}
            >
              <Tab label="All Settlements" />
              <Tab label="Money You Received" />
              <Tab label="Money You Paid" />
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab} index={0}>
            <SettlementHistory 
              key={`all-${refreshKey}`} 
              onDelete={handleSettlementSuccess}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <SettlementHistory 
              key={`received-${refreshKey}`} 
              filterType="received"
              onDelete={handleSettlementSuccess}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <SettlementHistory 
              key={`paid-${refreshKey}`} 
              filterType="paid"
              onDelete={handleSettlementSuccess}
            />
          </TabPanel>
        </CardContent>
      </Card>

      {/* Settlement Form Dialog */}
      <SettlementForm
        open={showSettlementForm}
        onClose={() => setShowSettlementForm(false)}
        onSuccess={handleSettlementSuccess}
      />
    </Container>
  );
};

export default Settlements;