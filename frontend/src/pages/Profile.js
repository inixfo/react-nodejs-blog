import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  alpha,
  Stack,
  Divider,
  Chip,
  Fade
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Add as AddIcon,
  Article as ArticleIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  getUser,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  updateUser,
  getCategories
} from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [settingsData, setSettingsData] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    console.log('Profile component mounted with ID:', id);
    console.log('Current user:', currentUser);
    
    // Wait for auth to be initialized
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      setError('Please log in to view profiles');
      setLoading(false);
      return;
    }

    // If no ID is provided, use the current user's ID
    const userId = id || currentUser.id || currentUser._id;
    if (!userId) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    fetchUser(userId);
    fetchUserPosts(userId);
    fetchCategories();
  }, [id, currentUser, authLoading]);

  const fetchUser = async (userId) => {
    try {
      console.log('Fetching user with ID:', userId);
      const response = await getUser(userId);
      console.log('User response:', response.data);
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError('Failed to fetch user');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.response?.data?.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      console.log('Fetching posts for user:', userId);
      const response = await getPosts(1, 10, { author: userId });
      console.log('Posts response:', response.data);
      if (response.data.success) {
        setPosts(response.data.data);
      } else {
        console.error('Failed to fetch posts:', response.data);
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories');
      const response = await getCategories();
      console.log('Categories response:', response.data);
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        console.error('Failed to fetch categories:', response.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (post = null) => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        category: post.category._id
      });
      setSelectedPost(post);
    } else {
      setFormData({
        title: '',
        content: '',
        category: ''
      });
      setSelectedPost(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPost(null);
    setFormData({
      title: '',
      content: '',
      category: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPost) {
        const response = await updatePost(selectedPost._id, formData);
        if (response.data.success) {
          fetchUserPosts();
          handleCloseDialog();
        }
      } else {
        const response = await createPost(formData);
        if (response.data.success) {
          fetchUserPosts();
          handleCloseDialog();
        }
      }
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await deletePost(postId);
        if (response.data.success) {
          fetchUserPosts();
        }
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
    setAnchorEl(null);
  };

  const handleMenu = (event, post) => {
    setSelectedPost(post);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingsChange = (e) => {
    setSettingsData({
      ...settingsData,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUser(user._id, settingsData);
      if (response.data.success) {
        // Update the local user state
        setUser(response.data.data);
        // Show success message
        setError('Profile updated successfully');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (authLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: theme.palette.primary.main,
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
        <Typography variant="h6" color="text.secondary">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Container>
        <Alert severity="warning">Please log in to view profiles</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: theme.palette.primary.main,
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
        <Typography variant="h6" color="text.secondary">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Container>
        <Alert severity="error">{error || 'User not found'}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              alt={user.name}
              src={user.avatar}
              sx={{ 
                width: 120, 
                height: 120, 
                mr: 3,
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {user.name[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {user.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              icon={<ArticleIcon />} 
              label="Posts" 
              iconPosition="start"
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Settings" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Content Area */}
        <Box sx={{ mt: 4 }}>
          <Fade in={true} timeout={500}>
            <Box>
              {activeTab === 0 && (
                <Box>
                  {currentUser && (currentUser.id === user._id || currentUser._id === user._id) && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        }
                      }}
                    >
                      Create Post
                    </Button>
                  )}

                  <Grid container spacing={3}>
                    {posts.map((post) => (
                      <Grid item xs={12} key={post._id}>
                        <Card 
                          sx={{ 
                            borderRadius: 2,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" gutterBottom>
                                  {post.title}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                  <Chip 
                                    label={post.category?.name} 
                                    size="small" 
                                    color="primary"
                                    sx={{ borderRadius: 1 }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                  </Typography>
                                </Stack>
                              </Box>
                              {currentUser && ((currentUser.id === user._id || currentUser._id === user._id) || currentUser.role === 'admin') && (
                                <IconButton onClick={(e) => handleMenu(e, post)}>
                                  <MoreVert />
                                </IconButton>
                              )}
                            </Box>
                            <Typography variant="body1" paragraph>
                              {post.content.substring(0, 200)}...
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              href={`/posts/${post._id}`}
                              sx={{ 
                                textTransform: 'none',
                                fontWeight: 500
                              }}
                            >
                              Read More
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {activeTab === 1 && currentUser && (currentUser.id === user._id || currentUser._id === user._id) && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4,
                    borderRadius: 4,
                    background: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)',
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Account Settings
                  </Typography>
                  <form onSubmit={handleSettingsSubmit}>
                    <Stack spacing={3} sx={{ maxWidth: 500, mt: 3 }}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={settingsData.name || user.name}
                        onChange={handleSettingsChange}
                        required
                        sx={{ borderRadius: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={settingsData.email || user.email}
                        onChange={handleSettingsChange}
                        required
                        sx={{ borderRadius: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Avatar URL"
                        name="avatar"
                        value={settingsData.avatar || user.avatar || ''}
                        onChange={handleSettingsChange}
                        helperText="Enter a URL for your profile picture"
                        sx={{ borderRadius: 2 }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ 
                          mt: 2,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          }
                        }}
                      >
                        Update Profile
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              )}
            </Box>
          </Fade>
        </Box>

        {/* Keep the existing Dialog and Menu components */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{selectedPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  sx={{ borderRadius: 2 }}
                />
                
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                    sx={{ borderRadius: 2 }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  sx={{ borderRadius: 2 }}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  }
                }}
              >
                {selectedPost ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          <MenuItem onClick={() => {
            handleOpenDialog(selectedPost);
            handleCloseMenu();
          }}>
            <Edit sx={{ mr: 1, color: 'text.secondary' }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => {
            handleDelete(selectedPost._id);
            handleCloseMenu();
          }}>
            <Delete sx={{ mr: 1, color: 'text.secondary' }} /> Delete
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default Profile; 