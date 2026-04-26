const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  siteName: {
    type: String,
    required: true,
    trim: true
  },
  siteUrl: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    required: true
  },
  encryptedPassword: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['social', 'banking', 'work', 'shopping', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Password', passwordSchema);