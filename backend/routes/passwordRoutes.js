const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validatePassword } = require('../middleware/validators');
const {
  getPasswords,
  addPassword,
  updatePassword,
  deletePassword
} = require('../controllers/passwordController');

router.get('/', protect, getPasswords);
router.post('/', protect, validatePassword, addPassword);
router.put('/:id', protect, validatePassword, updatePassword);
router.delete('/:id', protect, deletePassword);

module.exports = router;