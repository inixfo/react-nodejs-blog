import React, { useState } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { searchPosts } from '../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await searchPosts(query.trim());
      setResults(response.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to search posts');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!e.target.value.trim()) {
      setResults([]);
      setError(null);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
    setQuery('');
    setResults([]);
    setError(null);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          position: 'relative',
          boxShadow: 2
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search posts..."
          value={query}
          onChange={handleInputChange}
          inputProps={{ 'aria-label': 'search posts' }}
        />
        <IconButton 
          type="submit" 
          sx={{ p: '10px' }} 
          aria-label="search"
          disabled={loading || !query.trim()}
        >
          {loading ? <CircularProgress size={24} /> : <SearchIcon />}
        </IconButton>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {results.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1,
            boxShadow: 3
          }}
        >
          <List>
            {results.map((post) => (
              <React.Fragment key={post._id}>
                <ListItem
                  button
                  onClick={() => handlePostClick(post._id)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {post.author?.name?.charAt(0) || 'A'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={post.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography
                          component="p"
                          variant="body2"
                          color="text.primary"
                          sx={{ mt: 0.5 }}
                        >
                          {post.content.substring(0, 100)}
                          {post.content.length > 100 ? '...' : ''}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar; 