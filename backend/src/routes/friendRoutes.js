const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const friendController = require('../controllers/friendController');

const router = express.Router();

// Send friend request
router.post('/send',
  auth,
  [
    check('friend_id')
      .notEmpty()
      .withMessage('Friend ID is required')
      .isUUID()
      .withMessage('Invalid friend ID format')
  ],
  friendController.sendFriendRequest
);

// Accept friend request
router.put('/accept/:requestId',
  auth,
  friendController.acceptFriendRequest
);

// Reject friend request
router.put('/reject/:requestId',
  auth,
  friendController.rejectFriendRequest
);

// Get friend list
router.get('/list',
  auth,
  friendController.getFriends
);

// Get pending friend requests
router.get('/pending',
  auth,
  friendController.getPendingRequests
);

// Get sent friend requests
router.get('/sent',
  auth,
  friendController.getSentRequests
);

module.exports = router;