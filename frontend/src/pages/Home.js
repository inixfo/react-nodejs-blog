import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Pagination,
  Grid,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Fade,
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  alpha,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import PostCard from '../components/PostCard';
import { getPosts, likePost, deletePost, getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Add as AddIcon, 
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts(page, 10);
      if (response.data.success) {
        setPosts(response.data.data || []);
        const total = response.data.count || 0;
        setTotalPages(Math.ceil(total / 10));
      } else {
        setError('Failed to fetch posts');
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      fetchPosts();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        fetchPosts();
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  const filteredPosts = posts.filter(post => 
    !selectedCategory || post.category?._id === selectedCategory
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const drawer = (
    <Box sx={{ width: 250, mt: 2 }}>
      <List>
        <ListItem>
          <ListItemIcon>
            <Avatar src={user?.avatar}>{user?.name?.[0]}</Avatar>
          </ListItemIcon>
          <ListItemText 
            primary={user?.name} 
            secondary={user?.email}
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItemButton onClick={() => navigate('/')}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/profile')}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/settings')}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
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

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: { xs: 2, sm: 4 },
        pb: 6
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8} lg={9}>
            <Stack spacing={4}>
              {/* Posts Grid */}
              {filteredPosts.length === 0 ? (
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  <AutoAwesomeIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: 'primary.main',
                      mb: 2
                    }} 
                  />
                  <Typography variant="h6" gutterBottom>
                    No posts found
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {selectedCategory 
                      ? 'No posts found in this category.'
                      : 'Be the first to create a post!'}
                  </Typography>
                  {user && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/create')}
                      sx={{ 
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        }
                      }}
                    >
                      Create Post
                    </Button>
                  )}
                </Paper>
              ) : (
                <Fade in timeout={500}>
                  <Grid container spacing={3}>
                    {filteredPosts.map((post) => (
                      <Grid item xs={12} sm={6} md={6} lg={4} key={post._id}>
                        <PostCard
                          post={post}
                          onLike={handleLike}
                          onDelete={handleDelete}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Fade>
              )}

              {/* Pagination */}
              {filteredPosts.length > 0 && (
                <Box 
                  display="flex" 
                  justifyContent="center"
                  sx={{
                    '& .MuiPagination-root': {
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }
                      }
                    }
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size={isMobile ? "small" : "large"}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: isMobile ? '0.875rem' : '1rem'
                      }
                    }}
                  />
                </Box>
              )}
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4} lg={3}>
            <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
              {/* Create Post Card */}
              {user && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    border: 1,
                    borderColor: alpha(theme.palette.common.white, 0.1)
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Start Writing
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Share your thoughts and ideas with the community
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/create')}
                      sx={{ 
                        mt: 1,
                        borderRadius: 2,
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.common.white, 0.9)
                        }
                      }}
                    >
                      Create New Post
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Categories Card */}
              <Paper
                elevation={0}
                sx={{ 
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Categories
                </Typography>
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant={!selectedCategory ? 'contained' : 'outlined'}
                    onClick={() => setSelectedCategory('')}
                    startIcon={<CategoryIcon />}
                    sx={{ 
                      justifyContent: 'flex-start',
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1
                    }}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category._id}
                      fullWidth
                      variant={selectedCategory === category._id ? 'contained' : 'outlined'}
                      onClick={() => setSelectedCategory(category._id)}
                      startIcon={<CategoryIcon />}
                      sx={{ 
                        justifyContent: 'flex-start',
                        borderRadius: 2,
                        textTransform: 'none',
                        py: 1
                      }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 