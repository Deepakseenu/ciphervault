const Password = require('../models/Password');
const ShareToken = require('../models/ShareToken');
const { encrypt, decrypt } = require('../utils/encryption');
const { checkPasswordBreach } = require('../utils/breachChecker');
const { logActivity } = require('../utils/activityLogger');
const { differenceInDays } = require('date-fns');
const crypto = require('crypto');

// Get all passwords
const getPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user.id });
    
    const decrypted = passwords.map(p => {
      const daysSinceUpdate = differenceInDays(new Date(), new Date(p.updatedAt));
      
      return {
        _id: p._id,
        siteName: p.siteName,
        siteUrl: p.siteUrl,
        username: p.username,
        password: decrypt(p.encryptedPassword),
        category: p.category,
        notes: p.notes,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        // ✅ Password expiry warning
        daysSinceUpdate,
        needsUpdate: daysSinceUpdate > 90,
        expiryWarning: daysSinceUpdate > 90
          ? `⚠️ Password not updated in ${daysSinceUpdate} days`
          : null
      };
    });

    res.json(decrypted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add password
const addPassword = async (req, res) => {
  const { siteName, siteUrl, username, password, category, notes } = req.body;
  
  try {
    // ✅ Check for breaches before saving
    const breachResult = await checkPasswordBreach(password);

    const encryptedPassword = encrypt(password);
    
    const newEntry = await Password.create({
      userId: req.user.id,
      siteName,
      siteUrl,
      username,
      encryptedPassword,
      category,
      notes
    });

    // ✅ Log activity
    await logActivity({
      userId: req.user.id,
      action: 'PASSWORD_ADDED',
      req,
      details: `Added password for ${siteName}`,
      status: 'SUCCESS'
    });

    res.status(201).json({
      message: 'Password saved successfully',
      id: newEntry._id,
      breachCheck: breachResult
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update password
const updatePassword = async (req, res) => {
  const { siteName, siteUrl, username, password, category, notes } = req.body;
  
  try {
    const entry = await Password.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // ✅ Check breach if password changed
    let breachResult = null;
    if (password && password !== decrypt(entry.encryptedPassword)) {
      breachResult = await checkPasswordBreach(password);
    }

    entry.siteName = siteName || entry.siteName;
    entry.siteUrl = siteUrl || entry.siteUrl;
    entry.username = username || entry.username;
    entry.encryptedPassword = password ? encrypt(password) : entry.encryptedPassword;
    entry.category = category || entry.category;
    entry.notes = notes !== undefined ? notes : entry.notes;

    await entry.save();

    // ✅ Log activity
    await logActivity({
      userId: req.user.id,
      action: 'PASSWORD_UPDATED',
      req,
      details: `Updated password for ${entry.siteName}`,
      status: 'SUCCESS'
    });

    res.json({
      message: 'Password updated successfully',
      breachCheck: breachResult
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete password
const deletePassword = async (req, res) => {
  try {
    const entry = await Password.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // ✅ Log activity
    await logActivity({
      userId: req.user.id,
      action: 'PASSWORD_DELETED',
      req,
      details: `Deleted password for ${entry.siteName}`,
      status: 'SUCCESS'
    });

    res.json({ message: 'Password deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Create secure share link
const createShareLink = async (req, res) => {
  try {
    const entry = await Password.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Encrypt the password data separately for sharing
    const shareData = JSON.stringify({
      siteName: entry.siteName,
      siteUrl: entry.siteUrl,
      username: entry.username,
      password: decrypt(entry.encryptedPassword)
    });

    const encryptedData = encrypt(shareData);

    // Expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await ShareToken.create({
      token,
      passwordId: entry._id,
      createdBy: req.user.id,
      encryptedData,
      expiresAt
    });

    // ✅ Log activity
    await logActivity({
      userId: req.user.id,
      action: 'SHARE_CREATED',
      req,
      details: `Share link created for ${entry.siteName}`,
      status: 'SUCCESS'
    });

    res.json({
      message: 'Secure share link created',
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${token}`,
      expiresAt,
      warning: '⚠️ This link expires in 24 hours and can only be used once'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Access share link
const accessShareLink = async (req, res) => {
  try {
    const shareToken = await ShareToken.findOne({
      token: req.params.token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!shareToken) {
      return res.status(404).json({
        message: '⚠️ Share link is invalid, expired, or already used'
      });
    }

    // Mark as used — one time only!
    shareToken.used = true;
    shareToken.usedAt = new Date();
    await shareToken.save();

    // Decrypt the shared data
    const sharedData = JSON.parse(decrypt(shareToken.encryptedData));

    // ✅ Log access
    await logActivity({
      userId: shareToken.createdBy,
      action: 'SHARE_ACCESSED',
      req,
      details: `Share link accessed for ${sharedData.siteName}`,
      status: 'SUCCESS'
    });

    res.json({
      message: '✅ One-time access granted',
      data: sharedData,
      warning: '⚠️ This link has now been invalidated'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    
    const logs = await ActivityLog
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Check breach for existing password
const checkBreach = async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    const result = await checkPasswordBreach(password);
    
    await logActivity({
      userId: req.user.id,
      action: 'BREACH_CHECK',
      req,
      details: `Breach check performed`,
      status: result.breached ? 'WARNING' : 'SUCCESS'
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getPasswords,
  addPassword,
  updatePassword,
  deletePassword,
  createShareLink,
  accessShareLink,
  getActivityLogs,
  checkBreach
};