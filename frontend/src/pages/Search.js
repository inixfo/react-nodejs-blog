import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import PostCard from '../components/PostCard';
import { searchPosts, likePost, deletePost } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (query.trim()) {
      fetchSearchResults();
    }
  }, [query, page]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await searchPosts(query, page);
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch search results');
      console.error('Error searching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      setPage(1);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      fetchSearchResults();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        fetchSearchResults();
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Posts
      </Typography>

      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : query.trim() ? (
        <>
          <Typography variant="h6" gutterBottom>
            Search Results for "{query}"
          </Typography>

          {posts.length === 0 ? (
            <Typography align="center" color="text.secondary">
              No posts found matching your search.
            </Typography>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))}

              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            </>
          )}
        </>
      ) : (
        <Typography align="center" color="text.secondary">
          Enter a search term to find posts
        </Typography>
      )}
    </Container>
  );
};

export default Search; 