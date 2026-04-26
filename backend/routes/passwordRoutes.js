const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validatePassword } = require('../middleware/validators');
const {
  getPasswords,
  addPassword,
  updatePassword,
  deletePassword,
  createShareLink,
  accessShareLink,
  getActivityLogs,
  checkBreach
} = require('../controllers/passwordController');

// Password CRUD
router.get('/', protect, getPasswords);
router.post('/', protect, validatePassword, addPassword);
router.put('/:id', protect, validatePassword, updatePassword);
router.delete('/:id', protect, deletePassword);

// Share links
router.post('/:id/share', protect, createShareLink);
router.get('/share/:token', accessShareLink);

// Activity logs
router.get('/activity/logs', protect, getActivityLogs);

// Breach check
router.post('/breach/check', protect, checkBreach);

module.exports = router;