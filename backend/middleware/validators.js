const { body } = require('express-validator');

// Register validation rules
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('masterPassword')
    .notEmpty().withMessage('Master password is required')
    .isLength({ min: 8 }).withMessage('Master password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
];

// Login validation rules
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),

  body('masterPassword')
    .notEmpty().withMessage('Master password is required')
];

// Password entry validation rules
const validatePassword = [
  body('siteName')
    .trim()
    .notEmpty().withMessage('Site name is required')
    .isLength({ max: 100 }).withMessage('Site name too long'),

  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ max: 100 }).withMessage('Username too long'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 500 }).withMessage('Password too long'),

  body('category')
    .optional()
    .isIn(['social', 'banking', 'work', 'shopping', 'other'])
    .withMessage('Invalid category'),

  body('siteUrl')
    .optional()
    .trim()
    .isURL({ require_protocol: false }).withMessage('Invalid URL format'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes too long')
];

module.exports = { validateRegister, validateLogin, validatePassword };