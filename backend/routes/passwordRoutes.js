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
  checkBreach,
  exportVault
} = require('../controllers/passwordController');

router.get('/', protect, getPasswords);
router.post('/', protect, validatePassword, addPassword);
router.put('/:id', protect, validatePassword, updatePassword);
router.delete('/:id', protect, deletePassword);
router.post('/:id/share', protect, createShareLink);
router.get('/share/:token', accessShareLink);
router.get('/activity/logs', protect, getActivityLogs);
router.post('/breach/check', protect, checkBreach);
router.get('/export/vault', protect, exportVault);

module.exports = router;