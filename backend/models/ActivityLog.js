const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'REGISTER',
      'PASSWORD_ADDED',
      'PASSWORD_UPDATED',
      'PASSWORD_DELETED',
      'PASSWORD_VIEWED',
      'BREACH_CHECK',
      'SHARE_CREATED',
      'SHARE_ACCESSED'
    ],
    required: true
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  details: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'WARNING', 'FAILED'],
    default: 'SUCCESS'
  }
}, { timestamps: true });

// Auto delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);