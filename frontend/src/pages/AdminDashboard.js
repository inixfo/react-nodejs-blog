import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Grid,
  Stack,
  Avatar,
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Report as ReportIcon,
  Article as ArticleIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  Public as PublicIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  getReports,
  getReportsByStatus,
  updateReport,
  deleteReport,
  getPosts,
  deletePost,
  getUsers,
  deleteUser,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  updatePost,
  createPost,
  updateUser,
  createUser,
  getReportedComments,
  handleReportedComment
} from '../services/api';
import { alpha, useTheme } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';

const drawerWidth = 280;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reportTabValue, setReportTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { user } = useAuth();
  const [reportedComments, setReportedComments] = useState([]);
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const tabs = [
    { label: 'Dashboard', value: -1, icon: <DashboardIcon />, color: 'primary' },
    { label: 'Reports', value: 0, icon: <ReportIcon />, color: 'warning' },
    { label: 'Posts', value: 1, icon: <ArticleIcon />, color: 'info' },
    { label: 'Categories', value: 2, icon: <CategoryIcon />, color: 'success' },
    { label: 'Users', value: 3, icon: <PeopleIcon />, color: 'primary' }
  ];

  const fetchTabData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 0: // Reports
          const reportsResponse = reportTabValue === 0
            ? await getReports()
            : await getReportsByStatus(reportTabValue === 1 ? 'pending' : 'resolved');
          setReports(reportsResponse.data.data || []);
          break;
        case 1: // Posts
          const postsResponse = await getPosts();
          if (postsResponse.data.success) {
            setPosts(postsResponse.data.data || []);
          }
          break;
        case 2: // Categories
          const categoriesResponse = await getCategories();
          setCategories(categoriesResponse.data.data || []);
          break;
        case 3: // Users
          const usersResponse = await getUsers();
          setUsers(usersResponse.data.data || []);
          break;
      }
    } catch (err) {
      console.error('Error fetching tab data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Fetch all necessary data for the dashboard
        const [reportsRes, postsRes, categoriesRes, usersRes] = await Promise.all([
          getReports(),
          getPosts(),
          getCategories(),
          getUsers()
        ]);

        if (reportsRes.data.success) {
          setReports(reportsRes.data.data || []);
        }
        if (postsRes.data.success) {
          setPosts(postsRes.data.data || []);
        }
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data || []);
        }
        if (usersRes.data.success) {
          setUsers(usersRes.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    fetchReportedComments();
  }, []); // Only run on mount

  // Separate useEffect for tab-specific data
  useEffect(() => {
    if (activeTab >= 0) {
      fetchTabData();
    }
  }, [activeTab, reportTabValue]);

  const fetchReportedComments = async () => {
    try {
      const response = await getReportedComments();
      if (response.data.success) {
        setReportedComments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reported comments:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await handleReportedComment(commentId, { action: 'delete' });
      if (response.data.success) {
        fetchReportedComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleIgnoreReport = async (commentId) => {
    try {
      const response = await handleReportedComment(commentId, { action: 'ignore' });
      if (response.data.success) {
        fetchReportedComments();
      }
    } catch (error) {
      console.error('Error ignoring report:', error);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setMobileOpen(false); // Close mobile drawer when tab changes
    
    // Load categories when switching to posts tab
    if (value === 1) { // Posts tab
      const loadCategories = async () => {
        try {
          const categoriesResponse = await getCategories();
          setCategories(categoriesResponse.data.data || []);
        } catch (err) {
          console.error('Error loading categories:', err);
        }
      };
      loadCategories();
    }
  };

  const handleReportTabChange = (event, newValue) => {
    setReportTabValue(newValue);
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    if (type === 'post') {
      if (item) {
        setFormData({
          _id: item._id,
          title: item.title || '',
          content: item.content || '',
          category: item.category?._id || '',
          image: null
        });
      } else {
        setFormData({
          title: '',
          content: '',
          category: '',
          image: null
        });
      }
      setImagePreview(null);
    } else {
      setFormData(item || {});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        switch (type) {
          case 'report':
            await deleteReport(id);
            break;
          case 'post':
            await deletePost(id);
            break;
          case 'category':
            await deleteCategory(id);
            break;
          case 'user':
            await deleteUser(id);
            break;
        }
        fetchTabData();
      } catch (err) {
        console.error(`Error deleting ${type}:`, err);
      }
    }
    handleMenuClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      switch (dialogType) {
        case 'category':
          try {
            const categoryData = {
              name: formData.name ? formData.name.trim() : '',
              description: formData.description ? formData.description.trim() : ''
            };
            
            if (!categoryData.name || !categoryData.description) {
              setError('Name and description are required');
              return;
            }
            
            if (formData._id) {
              console.log('Updating category:', categoryData);
              await updateCategory(formData._id, categoryData);
            } else {
              console.log('Creating category:', categoryData);
              await createCategory(categoryData);
            }
            console.log('Category operation successful');
          } catch (err) {
            console.error('Category operation failed:', err);
            setError(err.response?.data?.message || 'Failed to save category');
            return;
          }
          break;
        case 'post':
          try {
            if (!formData.title?.trim() || !formData.content?.trim() || !formData.category) {
              setError('Title, content, and category are required');
              return;
            }

            const postData = new FormData();
            postData.append('title', formData.title.trim());
            postData.append('content', formData.content.trim());
            postData.append('category', formData.category);
            postData.append('status', 'published');
            
            // Add the current user as the author
            postData.append('author', user._id);
            
            if (formData.image) {
              postData.append('image', formData.image);
            }

            // Log the FormData contents for debugging
            console.log('Submitting post with data:');
            for (let pair of postData.entries()) {
              console.log(pair[0] + ': ' + pair[1]);
            }

            if (formData._id) {
              await updatePost(formData._id, postData);
            } else {
              try {
                const response = await createPost(postData);
                console.log('Post creation response:', response);
                if (response.data.success) {
                  handleCloseDialog();
                  // Refresh the posts list
                  const postsResponse = await getPosts();
                  console.log('Posts after refresh:', postsResponse.data);
                  if (postsResponse.data.success) {
                    setPosts(postsResponse.data.data || []);
                  }
                } else {
                  setError(response.data.message || 'Failed to create post');
                }
              } catch (err) {
                console.error('Post creation error details:', {
                  message: err.message,
                  response: err.response?.data,
                  status: err.response?.status
                });
                setError(err.response?.data?.message || 'Failed to create post');
                return;
              }
            }
          } catch (err) {
            console.error('Post operation failed:', err);
            setError(err.response?.data?.message || 'Failed to save post');
            return;
          }
          break;
        case 'user':
          try {
            const userData = {
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: formData.password,
              role: formData.role,
              isApproved: formData.isApproved
            };

            if (formData._id) {
              await updateUser(formData._id, userData);
            } else {
              await createUser(userData);
            }
          } catch (err) {
            console.error('User operation failed:', err);
            setError(err.response?.data?.message || 'Failed to save user');
            return;
          }
          break;
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      setLoading(true);
      const response = await updateUser(id, data);
      if (response.data.success) {
        // Refresh the users list
        const usersResponse = await getUsers();
        if (usersResponse.data.success) {
          setUsers(usersResponse.data.data || []);
        }
        // Show success message
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to update user',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update user',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setLoading(true);
      const response = await updateUser(userId, { isApproved: true });
      if (response.data.success) {
        // Update the users list to reflect the change
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isApproved: true } : user
        ));
        setSnackbar({
          open: true,
          message: 'User approved successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error approving user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to approve user',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    await handleUpdateUser(userId, { status: 'blocked' });
  };

  const handleResolveReport = async (reportId) => {
    try {
      const response = await updateReport(reportId, { status: 'resolved' });
      if (response.data.success) {
        // Update the reports state immediately
        setReports(reports.map(report => 
          report._id === reportId 
            ? { ...report, status: 'resolved' }
            : report
        ));
      } else {
        setError('Failed to resolve report');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve report');
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        px: 2,
        py: 2,
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white'
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {tabs.map((tab) => (
          <ListItem key={tab.value} disablePadding>
            <ListItemButton
              selected={activeTab === tab.value}
              onClick={() => handleTabChange(tab.value)}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette[tab.color || 'primary'].main, 0.1),
                  color: theme.palette[tab.color || 'primary'].main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette[tab.color || 'primary'].main, 0.15),
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: activeTab === tab.value ? theme.palette[tab.color || 'primary'].main : 'text.secondary',
                minWidth: 40
              }}>
                {tab.icon}
              </ListItemIcon>
              <ListItemText 
                primary={tab.label}
                primaryTypographyProps={{ 
                  fontWeight: activeTab === tab.value ? 600 : 400
                }}
              />
              {tab.label === 'Reports' && reports.filter(r => r.status === 'pending').length > 0 && (
                <Chip
                  size="small"
                  label={reports.filter(r => r.status === 'pending').length}
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PublicIcon />}
          href="/"
          sx={{
            borderRadius: 2,
            py: 1,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
            }
          }}
        >
          Visit Website
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const renderReportsTab = () => (
    <>
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={reportTabValue}
          onChange={handleReportTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Reports" />
          <Tab label="Pending Reports" />
          <Tab label="Resolved Reports" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report._id}</TableCell>
                <TableCell>{report.reportedItemType}</TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={report.status === 'pending' ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>
                  {new Date(report.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {report.status === 'pending' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleResolveReport(report._id)}
                      sx={{ mr: 1 }}
                    >
                      Resolve
                    </Button>
                  )}
                  <IconButton onClick={(e) => handleMenuClick(e, { type: 'report', id: report._id })}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Reported Comments
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Content</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Reports</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportedComments.map((comment) => (
                <TableRow key={comment._id}>
                  <TableCell>{comment.content}</TableCell>
                  <TableCell>{comment.author.name}</TableCell>
                  <TableCell>{comment.reports.length}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteComment(comment._id)}
                      sx={{ mr: 1 }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleIgnoreReport(comment._id)}
                    >
                      Ignore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );

  const renderPostsTab = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog('post')}
        >
          Add Post
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post._id}>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.author?.name}</TableCell>
                <TableCell>{post.category?.name}</TableCell>
                <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog('post', post)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => handleMenuClick(e, { type: 'post', id: post._id })}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderCategoriesTab = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog('category')}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog('category', category)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => handleMenuClick(e, { type: 'category', id: category._id })}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderUsersTab = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog('user')}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isApproved ? 'Approved' : 'Pending'}
                    color={user.isApproved ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {!user.isApproved && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleApproveUser(user._id)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                  )}
                  <IconButton onClick={() => handleOpenDialog('user', user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => handleMenuClick(e, { type: 'user', id: user._id })}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderDashboard = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              border: 1,
              borderColor: 'warning.main'
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6" color="warning.main">
                  Pending Reports
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {reports.filter(r => r.status === 'pending').length}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              border: 1,
              borderColor: 'info.main'
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArticleIcon color="info" />
                <Typography variant="h6" color="info.main">
                  Total Posts
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {posts.length}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              border: 1,
              borderColor: 'success.main'
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="success" />
                <Typography variant="h6" color="success.main">
                  Categories
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {categories.length}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: 1,
              borderColor: 'primary.main'
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="primary" />
                <Typography variant="h6" color="primary.main">
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {users.length}
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Reports
            </Typography>
            <List>
              {reports.slice(0, 5).map((report) => (
                <ListItem
                  key={report._id}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <ReportIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={report.reason}
                    secondary={formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  />
                  <Chip
                    label={report.status}
                    size="small"
                    color={report.status === 'pending' ? 'warning' : 'success'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Posts */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Posts
            </Typography>
            <List>
              {posts.slice(0, 5).map((post) => (
                <ListItem
                  key={post._id}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <ArticleIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={post.title}
                    secondary={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  />
                  <Chip
                    label={post.category?.name}
                    size="small"
                    color="info"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              color: 'text.primary',
              fontWeight: 600
            }}
          >
            {tabs.find(tab => tab.value === activeTab)?.label || 'Admin Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default'
        }}
      >
        {activeTab === -1 && renderDashboard()}
        {activeTab === 0 && renderReportsTab()}
        {activeTab === 1 && renderPostsTab()}
        {activeTab === 2 && renderCategoriesTab()}
        {activeTab === 3 && renderUsersTab()}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDelete(selectedItem?.type, selectedItem?.id)}>
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArticleIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {dialogType === 'category' ? (formData._id ? 'Edit Category' : 'Add Category') : ''}
              {dialogType === 'post' ? (formData._id ? 'Edit Post' : 'Create New Post') : ''}
              {dialogType === 'user' ? 'Edit User' : ''}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {dialogType === 'category' && (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          )}
          {dialogType === 'post' && (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ArticleIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Post Details
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    error={!formData.title?.trim()}
                    helperText={!formData.title?.trim() ? 'Title is required' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CategoryIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Category
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    select
                    label="Select a category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    error={!formData.category}
                    helperText={!formData.category ? 'Please select a category' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhotoCameraIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Cover Image
                    </Typography>
                  </Box>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      textAlign: 'center'
                    }}
                  >
                    {imagePreview ? (
                      <Box>
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: 200,
                            borderRadius: 2,
                            overflow: 'hidden',
                            mb: 2
                          }}
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <IconButton
                            onClick={() => {
                              setFormData({ ...formData, image: null });
                              setImagePreview(null);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'background.paper',
                              boxShadow: 1,
                              '&:hover': { bgcolor: 'background.paper' }
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Click the X to remove the image
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <input
                          accept="image/*"
                          type="file"
                          hidden
                          id="admin-image-upload"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setFormData({ ...formData, image: file });
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <label htmlFor="admin-image-upload">
                          <Button
                            component="span"
                            variant="outlined"
                            startIcon={<PhotoCameraIcon />}
                            sx={{ mb: 1 }}
                          >
                            Upload Image
                          </Button>
                        </label>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Recommended size: 1200x600 pixels
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ArticleIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Content
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Write your post content here..."
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    error={!formData.content?.trim()}
                    helperText={!formData.content?.trim() ? 'Content is required' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          )}
          {dialogType === 'user' && (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
              {!formData._id && (
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  margin="normal"
                  required={!formData._id}
                />
              )}
              <TextField
                fullWidth
                select
                label="Role"
                value={formData.role || 'user'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                margin="normal"
                required
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isApproved || false}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                  />
                }
                label="Approved"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            {formData._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 