import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Tooltip,
  Avatar,
  AvatarGroup,
  Fab,
  Skeleton,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Paper,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/group';
import GroupForm from './GroupForm';
import { useAuth } from '../../contexts/AuthContext';

interface Group {
  id: string;
  name: string;
  description: string;
  members: Array<{ id: string; name: string; email: string }>;
  totalExpenses?: number;
  totalBalance?: number;
  category?: string;
  recentActivity?: string;
}

type SortOption = 'name_asc' | 'name_desc' | 'recent_first' | 'oldest_first' | 'most_members' | 'least_members';

const Groups = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent_first');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getGroups();
      setGroups(response as Group[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData: any) => {
    try {
      const newGroup = await groupService.createGroup(groupData);
      setGroups(prevGroups => [...prevGroups, newGroup as Group]);
      setOpenForm(false);
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = (option?: SortOption) => {
    setSortAnchorEl(null);
    if (option) {
      setSortBy(option);
    }
  };

  const filteredAndSortedGroups = React.useMemo(() => {
    let result = [...groups];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(group => 
        group.name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query) ||
        group.members.some(member => member.name.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(group => group.category === filterCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'most_members':
          return b.members.length - a.members.length;
        case 'least_members':
          return a.members.length - b.members.length;
        case 'recent_first':
          return new Date(b.recentActivity || 0).getTime() - new Date(a.recentActivity || 0).getTime();
        case 'oldest_first':
          return new Date(a.recentActivity || 0).getTime() - new Date(b.recentActivity || 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [groups, searchQuery, sortBy, filterCategory]);

  const renderGroupCard = (group: Group) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
                fontSize: '1.25rem',
                fontWeight: 600
              }}
            >
              {group.name[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" gutterBottom={false} fontWeight={600}>
                {group.name}
              </Typography>
              {group.category && (
                <Chip 
                  label={group.category}
                  size="small"
                  sx={{ 
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {group.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.5em'
            }}
          >
            {group.description}
          </Typography>
        )}

        <Stack direction="row" spacing={3} mb={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Members
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {group.members.length}
            </Typography>
          </Box>
          {group.totalExpenses !== undefined && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                ${group.totalExpenses.toFixed(2)}
              </Typography>
            </Box>
          )}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
        </Box>
      </CardContent>

      <Divider />
      
      <CardActions sx={{ p: 2, gap: 1 }}>
        <Button 
          size="small" 
          variant="outlined"
          startIcon={<LibraryBooksIcon />}
          onClick={() => navigate(`/groups/${group.id}`)}
          sx={{
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter'
            }
          }}
        >
          View Details
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<AccountBalanceWalletIcon />}
          onClick={() => navigate(`/groups/${group.id}?tab=expenses`)}
          sx={{
            boxShadow: 'none',
            '&:hover': {
              boxShadow: theme.shadows[2]
            }
          }}
        >
          Add Expense
        </Button>
      </CardActions>
    </Card>
  );

  const renderSkeletonCard = () => (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} />
          </Box>
        </Box>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography variant="h4" component="h1" fontWeight={600}>
            My Groups
          </Typography>
          <Tooltip title="Create New Group">
            <Fab 
              color="primary" 
              aria-label="add group"
              onClick={() => setOpenForm(true)}
              sx={{
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* Filters Section */}
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
            borderRadius: 2
          }}
        >
          <TextField
            fullWidth
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: { md: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e: SelectChangeEvent) => setFilterCategory(e.target.value)}
              label="Category"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon sx={{ ml: 1 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="trip">Trip</MenuItem>
              <MenuItem value="home">Home</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <Button
            onClick={handleSortClick}
            startIcon={<SortIcon />}
            sx={{
              minWidth: 100,
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter'
              }
            }}
          >
            Sort
          </Button>

          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={() => handleSortClose()}
          >
            <MenuItem 
              onClick={() => handleSortClose('name_asc')}
              selected={sortBy === 'name_asc'}
            >
              Name (A-Z)
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('name_desc')}
              selected={sortBy === 'name_desc'}
            >
              Name (Z-A)
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('recent_first')}
              selected={sortBy === 'recent_first'}
            >
              Most Recent
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('oldest_first')}
              selected={sortBy === 'oldest_first'}
            >
              Oldest First
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('most_members')}
              selected={sortBy === 'most_members'}
            >
              Most Members
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortClose('least_members')}
              selected={sortBy === 'least_members'}
            >
              Least Members
            </MenuItem>
          </Menu>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography color="text.secondary">
              {filteredAndSortedGroups.length} {filteredAndSortedGroups.length === 1 ? 'group' : 'groups'} found
            </Typography>
          </Box>
        </Paper>

        {/* Empty State */}
        {!loading && filteredAndSortedGroups.length === 0 && (
          <Paper
            sx={{ 
              textAlign: 'center',
              py: 8,
              px: 2,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <GroupsIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Groups Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery 
                ? "No groups match your search criteria"
                : "Start by creating your first group"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              Create New Group
            </Button>
          </Paper>
        )}

        {/* Groups Grid */}
        <Grid container spacing={3}>
          {loading
            ? Array.from(new Array(6)).map((_, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  {renderSkeletonCard()}
                </Grid>
              ))
            : filteredAndSortedGroups.map((group) => (
                <Grid item xs={12} sm={6} lg={4} key={group.id}>
                  {renderGroupCard(group)}
                </Grid>
              ))}
        </Grid>
      </Box>

      {/* Create Group Form */}
      <GroupForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCreateGroup}
      />
    </Container>
  );
};

export default Groups;