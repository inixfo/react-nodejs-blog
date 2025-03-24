import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const reportComment = async (commentId, reportData) => {
  return await axios.post(`${API_URL}/comments/${commentId}/report`, reportData, {
    withCredentials: true
  });
}; 