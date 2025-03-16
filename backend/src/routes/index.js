const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const groupController = require('../controllers/groupController');
const expenseController = require('../controllers/expenseController');
const friendRoutes = require('./friendRoutes');
const expenseRoutes = require('./expenseRoutes');
const balanceRoutes = require('./balanceRoutes');

const router = express.Router();

// Friend routes
router.use('/friends', friendRoutes);

// Expense routes
router.use('/expenses', expenseRoutes);

// Balance routes
router.use('/balances', balanceRoutes);

// User routes
router.post('/users/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  userController.register
);

router.post('/users/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  userController.login
);

router.get('/users/profile', auth, userController.getProfile);

// Add route for getting user by email
router.get('/users/by-email/:email', auth, userController.getUserByEmail);

// Group routes
router.post('/groups',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('description').optional().trim()
  ],
  groupController.createGroup
);

router.get('/groups', auth, groupController.getGroups);
router.get('/groups/:groupId', auth, groupController.getGroupDetails);

router.put('/groups/:groupId',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('description').optional().trim(),
    body('category').isIn(['Home', 'Trip', 'Other']).withMessage('Invalid category'),
    body('members').isArray().withMessage('Members must be an array')
  ],
  groupController.updateGroup
);

router.post('/groups/:groupId/members',
  auth,
  [
    body('email').isEmail().withMessage('Invalid email format')
  ],
  groupController.addMember
);

router.delete('/groups/:groupId/members/:memberId', auth, groupController.removeMember);
router.delete('/groups/:groupId', auth, groupController.deleteGroup);

module.exports = router;