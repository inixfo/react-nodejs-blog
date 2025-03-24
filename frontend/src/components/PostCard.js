import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  CardHeader,
  Avatar,
  CardMedia
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  MoreVert
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const API_URL = 'http://localhost:5000';

const PostCard = ({ post, onLike, onDelete }) => {
  const { user } = useAuth();
  const isLiked = post.likes.includes(user?.id);

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={
          <Avatar alt={post.author.name} src={post.author.avatar}>
            {post.author.name[0]}
          </Avatar>
        }
        action={
          user && (user.id === post.author._id || user.role === 'admin') && (
            <IconButton onClick={() => onDelete(post._id)}>
              <MoreVert />
            </IconButton>
          )
        }
        title={
          <Typography
            component={RouterLink}
            to={`/posts/${post._id}`}
            variant="h6"
            sx={{
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {post.title}
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              By {post.author.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        }
      />
      {post.image && (
        <CardMedia
          component="img"
          height="200"
          image={`${API_URL}${post.image}`}
          alt={post.title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {post.content}
        </Typography>
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                component={RouterLink}
                to={`/tags/${tag}`}
                sx={{ textDecoration: 'none' }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      <CardActions>
        <IconButton
          onClick={() => onLike(post._id)}
          color={isLiked ? 'error' : 'default'}
        >
          {isLiked ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.likes.length}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Comment sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {post.comments.length}
          </Typography>
        </Box>
        <Button
          size="small"
          component={RouterLink}
          to={`/posts/${post._id}`}
          sx={{ ml: 'auto' }}
        >
          Read More
        </Button>
      </CardActions>
    </Card>
  );
};

export default PostCard; 