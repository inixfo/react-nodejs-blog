import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  IconButton,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  MoreVert,
  Edit,
  Delete,
  Report,
  ThumbUp
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import Comment from '../components/Comment';
import ReportForm from '../components/ReportForm';
import {
  getPost,
  likePost,
  deletePost,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  likeComment,
  reportComment
} from '../services/api';
import { alpha, useTheme } from '@mui/material/styles';

const API_URL = 'http://localhost:5000';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [reportCommentId, setReportCommentId] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportError, setReportError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await getPost(id);
      if (response.data.success) {
        setPost(response.data.data);
      } else {
        setError('Failed to fetch post');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await getComments(id);
      if (response.data.success) {
        setComments(response.data.data);
      } else {
        setError('Failed to fetch comments');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch comments');
    }
  };

  const handleLike = async () => {
    try {
      await likePost(id);
      fetchPost();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        navigate('/');
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await addComment(id, { content: newComment });
      if (response.data.success) {
        setNewComment('');
        fetchComments();
      } else {
        setError('Failed to add comment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await deleteComment(commentId);
      if (response.data.success) {
        fetchComments();
      } else {
        setError('Failed to delete comment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await likeComment(commentId);
      if (response.data.success) {
        fetchComments();
      } else {
        setError('Failed to like comment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to like comment');
    }
  };

  const handleReportComment = (commentId) => {
    setReportCommentId(commentId);
    setReportOpen(true);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReport = async () => {
    try {
      await reportComment(id, {
        reason: reportReason,
        description: reportDescription
      });
      setReportDialogOpen(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      setReportError('Error reporting comment');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Container>
        <Alert severity="error">{error || 'Post not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box 
        sx={{ 
          maxWidth: 800, 
          mx: 'auto',
          position: 'relative'
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Link 
              to={`/profile/${post.author._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  alt={post.author?.name || 'User'}
                  src={post.author?.avatar}
                  sx={{ 
                    width: 56,
                    height: 56,
                    mr: 2,
                    border: 2,
                    borderColor: 'primary.main'
                  }}
                >
                  {(post.author?.name || 'U')[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {post.author?.name || 'Anonymous User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
            </Link>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              {user && (
                <>
                  <IconButton 
                    onClick={handleLike}
                    sx={{ 
                      color: post.likes?.includes(user.id) ? 'error.main' : 'text.secondary',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    {post.likes?.includes(user.id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {post.likes?.length || 0}
                  </Typography>
                  {user.id !== post.author._id && (
                    <IconButton
                      onClick={() => setReportDialogOpen(true)}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: 'warning.main' }
                      }}
                    >
                      <Report />
                    </IconButton>
                  )}
                </>
              )}
              {user && (user.id === post.author._id || user.role === 'admin') && (
                <>
                  <IconButton 
                    onClick={handleMenu}
                    sx={{
                      ml: 1,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        borderRadius: 2,
                        mt: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        '& .MuiMenuItem-root': {
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          mx: 0.5,
                          my: 0.25
                        }
                      }
                    }}
                  >
                    <MenuItem onClick={handleDelete}>
                      <Delete sx={{ mr: 1, color: 'error.main' }} /> Delete
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>

          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              mb: 3
            }}
          >
            {post.title}
          </Typography>

          {post.image && (
            <Box
              sx={{
                width: '100%',
                height: 'auto',
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={post.image.startsWith('http') ? post.image : `${API_URL}${post.image}`}
                alt={post.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '600px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}

          {post.category && post.category.name && (
            <Box sx={{ mb: 4 }}>
              <Chip 
                label={post.category.name}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontWeight: 500
                }}
              />
            </Box>
          )}

          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.8,
              color: 'text.primary',
              mb: 4
            }}
          >
            {post.content}
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Comments ({comments.length})
            </Typography>
            {user ? (
              <Box component="form" onSubmit={handleComment} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!newComment.trim()}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    }
                  }}
                >
                  Post Comment
                </Button>
              </Box>
            ) : (
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: 1,
                  borderColor: 'info.main'
                }}
              >
                Please <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>log in</Link> to comment
              </Alert>
            )}
          </Box>

          <List sx={{ mt: 2 }}>
            {comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                currentUser={user}
                onDelete={handleDeleteComment}
                onLike={handleLikeComment}
                onReport={handleReportComment}
              />
            ))}
          </List>
        </Paper>
      </Box>

      <ReportForm
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
        commentId={reportCommentId}
      />

      <Dialog 
        open={reportDialogOpen} 
        onClose={() => setReportDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle>Report Comment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              label="Reason"
            >
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="harassment">Harassment</MenuItem>
              <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
          {reportError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {reportError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setReportDialogOpen(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReport}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostDetail; 