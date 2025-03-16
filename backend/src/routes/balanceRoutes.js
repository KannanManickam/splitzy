const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all balance routes
router.use(authMiddleware);

// Get all balances with friends
router.get('/', balanceController.getFriendBalances);

// Get balance details with a specific friend
router.get('/friend/:friendId', balanceController.getBalanceWithFriend);

// Get payment suggestions
router.get('/suggestions', balanceController.getPaymentSuggestions);

module.exports = router;