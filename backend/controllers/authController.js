const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

// Register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { username, email, masterPassword } = req.body;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already exists with this email' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(masterPassword, salt);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      masterPassword: hashedPassword
    });

    // ✅ Log registration
    await logActivity({
      userId: user._id,
      action: 'REGISTER',
      req,
      details: `New account created for ${email}`,
      status: 'SUCCESS'
    });

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, masterPassword } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // ✅ Log failed attempt even if user doesn't exist
      await logActivity({
        userId: '000000000000000000000000', // placeholder
        action: 'LOGIN_FAILED',
        req,
        details: `Failed login attempt for ${email}`,
        status: 'FAILED'
      }).catch(() => {}); // Silent fail

      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(masterPassword, user.masterPassword);

    if (!isMatch) {
      // ✅ Log failed login
      await logActivity({
        userId: user._id,
        action: 'LOGIN_FAILED',
        req,
        details: `Wrong password attempt for ${email}`,
        status: 'FAILED'
      });

      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // ✅ Log successful login
    await logActivity({
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      req,
      details: `Successful login`,
      status: 'SUCCESS'
    });

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