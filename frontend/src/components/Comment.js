import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  Menu,
  MenuItem,
  Paper,
  Divider
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  MoreVert,
  Edit,
  Delete,
  Report,
  Reply
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reportComment } from '../services/commentService';
import { useSnackbar } from '../contexts/SnackbarContext';

const Comment = ({ comment, onLike, onDelete, onUpdate, onReply }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const { setSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    handleClose();
  };

  const handleSave = async () => {
    try {
      await onUpdate(comment._id, editedContent);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await onDelete(comment._id);
      } catch (err) {
        console.error('Error deleting comment:', err);
      }
    }
    handleClose();
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await onReply(comment._id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  const handleReport = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await reportComment(comment._id, {
        reason: reportReason,
        description: reportDescription
      });

      if (response.data.success) {
        setReportDialogOpen(false);
        setReportReason('');
        setReportDescription('');
        // Show success message
        setSnackbar({
          open: true,
          message: 'Comment reported successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to report comment',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error reporting comment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to report comment',
        severity: 'error'
      });
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar
          alt={comment.author?.name || 'User'}
          src={comment.author?.avatar}
          sx={{ mr: 2 }}
        >
          {(comment.author?.name || 'U')[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ mr: 1 }}>
              {comment.author?.name || 'Anonymous User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </Typography>
            {user && (user.id === comment.author?.id || user.role === 'admin') && (
              <>
                <IconButton size="small" onClick={handleMenu}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleEdit}>
                    <Edit sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={handleDelete}>
                    <Delete sx={{ mr: 1 }} /> Delete
                  </MenuItem>
                  {user.role !== 'admin' && (
                    <MenuItem onClick={() => {
                      setReportDialogOpen(true);
                      handleClose();
                    }}>
                      <Report sx={{ mr: 1 }} /> Report
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>

          {isEditing ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" paragraph>
              {comment.content}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => onLike(comment._id)}
              color={comment.likes?.includes(user?.id) ? 'error' : 'default'}
            >
              {comment.likes?.includes(user?.id) ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {comment.likes?.length || 0} likes
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply />
            </IconButton>
          </Box>

          {showReplyForm && (
            <Box component="form" onSubmit={handleReply} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  type="submit"
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
              </Box>
            </Box>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              {comment.replies.map((reply) => (
                <Box key={reply._id} sx={{ ml: 4, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      alt={reply.author?.name || 'User'}
                      src={reply.author?.avatar}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    >
                      {(reply.author?.name || 'U')[0]}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      {reply.author?.name || 'Anonymous User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {reply.content}
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default Comment; 