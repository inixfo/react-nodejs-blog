const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedContent: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentType',
    required: true
  },
  contentType: {
    type: String,
    required: true,
    enum: ['Post', 'Comment']
  },
  reason: {
    type: String,
    required: true,
    enum: ['inappropriate', 'spam', 'hate_speech', 'other']
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema); 