import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { createReport, reportComment } from '../services/api';

const ReportForm = ({ open, onClose, contentType, contentId }) => {
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!contentId) {
        setError('Invalid content ID');
        return;
      }

      const reportData = {
        reason: formData.reason,
        description: formData.description
      };

      let response;
      if (contentType === 'Comment') {
        response = await reportComment(contentId, reportData);
      } else {
        response = await createReport({
          ...reportData,
          contentType,
          reportedContent: contentId
        });
      }

      if (response.data.success) {
        onClose();
        setFormData({ reason: '', description: '' });
      } else {
        setError(response.data.message || 'Failed to submit report');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Report Content</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Reason</InputLabel>
              <Select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                label="Reason"
              >
                <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
                <MenuItem value="spam">Spam</MenuItem>
                <MenuItem value="hate_speech">Hate Speech</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              required
              error={!!error}
              helperText={error}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="error">
            Submit Report
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReportForm; 