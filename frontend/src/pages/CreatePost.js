import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Fade,
  Chip,
  Divider
} from '@mui/material';
import { 
  PhotoCamera, 
  Close, 
  ArrowBack,
  Article as ArticleIcon,
  Category as CategoryIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { createPost, getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { alpha, useTheme } from '@mui/material/styles';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: null
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
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
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      setImagePreview(URL.createObjectURL(file));
      setImageDialogOpen(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null
    });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      return setError('Please fill in all required fields');
    }

    try {
      setError('');
      setLoading(true);

      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('content', formData.content);
      postData.append('category', formData.category);
      if (formData.image) {
        postData.append('image', formData.image);
      }

      const response = await createPost(postData);
      if (response.data.success) {
        navigate('/');
      } else {
        setError(response.data.message || 'Failed to create post');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 8,
        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Create New Post
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: 1,
            borderColor: 'divider'
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ArticleIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Post Details
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CategoryIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Category
                  </Typography>
                </Box>
                <FormControl fullWidth required>
                  <InputLabel>Select a category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Select a category"
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ImageIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
                          onClick={handleRemoveImage}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': { bgcolor: 'background.paper' }
                          }}
                        >
                          <Close />
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
                        id="image-upload"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="image-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<PhotoCamera />}
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
                  <ArticleIcon color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Content
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  label="Write your post content here..."
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Publish Post'
                  )}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/')}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    textTransform: 'none',
                    fontSize: '1.1rem'
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreatePost; 