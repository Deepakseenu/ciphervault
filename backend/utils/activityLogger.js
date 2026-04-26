const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, action, req, details = '', status = 'SUCCESS' }) => {
  try {
    const ipAddress = 
      req?.headers['x-forwarded-for']?.split(',')[0] ||
      req?.connection?.remoteAddress ||
      req?.socket?.remoteAddress ||
      'unknown';

    const userAgent = req?.headers['user-agent'] || 'unknown';

    await ActivityLog.create({
      userId,
      action,
      ipAddress,
      userAgent,
      details,
      status
    });
  } catch (err) {
    // Never let logging failure break the main flow
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity };