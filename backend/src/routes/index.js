const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const multer = require('multer');
const userController = require('../controllers/userController');
const groupController = require('../controllers/groupController');
const expenseController = require('../controllers/expenseController');
const friendRoutes = require('./friendRoutes');
const expenseRoutes = require('./expenseRoutes');
const balanceRoutes = require('./balanceRoutes');
const groupExpenseRoutes = require('./groupExpenseRoutes');
const settlementRoutes = require('./settlementRoutes');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-pictures');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image file'), false);
    }
  }
});

// Friend routes
router.use('/friends', friendRoutes);

// Expense routes
router.use('/expenses', expenseRoutes);

// Balance routes
router.use('/balances', balanceRoutes);

// Settlement routes
router.use('/settlements', settlementRoutes);

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

// New profile customization routes
router.put('/users/profile',
  auth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  userController.updateProfile
);

router.put('/users/preferences',
  auth,
  [
    body('currency_preference').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Invalid currency code'),
    body('timezone').optional().isString().withMessage('Invalid timezone'),
    body('notification_preferences').optional().isObject().withMessage('Invalid notification preferences')
  ],
  userController.updatePreferences
);

router.post('/users/profile-picture',
  auth,
  upload.single('profile_picture'),
  userController.uploadProfilePicture
);

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

// Mount group expense routes under /groups
router.use('/groups', groupExpenseRoutes);

module.exports = router;