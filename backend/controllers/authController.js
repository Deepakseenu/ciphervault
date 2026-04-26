const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Register
const register = async (req, res) => {
  // ✅ Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg
    });
  }

  const { username, email, masterPassword } = req.body;

  try {
    // ✅ Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    // ✅ Hash with bcrypt salt 12
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(masterPassword, salt);

    // ✅ Create user
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      masterPassword: hashedPassword
    });

    // ✅ Sign JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login
const login = async (req, res) => {
  // ✅ Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg
    });
  }

  const { email, masterPassword } = req.body;

  try {
    // ✅ Find user — don't reveal if email exists or not (security best practice)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(masterPassword, user.masterPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // ✅ Sign JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login };