const { body, validationResult } = require('express-validator');

// Common validation rules
const userValidationRules = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('bio').optional().isString().trim(),
    body('location').optional().isString().trim(),
    body('age').optional().isInt({ min: 13 }).withMessage('Must be at least 13 years old'),
    body('experience').optional().isString().trim()
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  update: [
    body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('firstName').optional().isString().trim(),
    body('lastName').optional().isString().trim(),
    body('bio').optional().isString().trim(),
    body('location').optional().isString().trim(),
    body('age').optional().isInt({ min: 13 }).withMessage('Must be at least 13 years old'),
    body('experience').optional().isString().trim()
  ]
};

const postValidationRules = {
  create: [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('content').notEmpty().trim().withMessage('Content is required')
  ],
  update: [
    body('title').optional().trim(),
    body('content').optional().trim()
  ]
};

const commentValidationRules = {
  create: [
    body('content').notEmpty().trim().withMessage('Comment content is required')
  ],
  update: [
    body('content').notEmpty().trim().withMessage('Comment content is required')
  ]
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  userValidationRules,
  postValidationRules,
  commentValidationRules,
  validate
}; 