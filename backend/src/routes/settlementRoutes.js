const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const auth = require('../middleware/auth');

// All settlement routes require authentication
router.use(auth);

// Create a new settlement
router.post('/', [
  body('payer_id').isUUID().withMessage('Valid payer ID is required'),
  body('receiver_id').isUUID().withMessage('Valid receiver ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required (min 0.01)'),
  body('date').optional().isISO8601().withMessage('Date must be in ISO format'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('group_id').optional().isUUID().withMessage('Group ID must be a valid UUID')
], settlementController.createSettlement);

// Get all settlements for the current user
router.get('/', settlementController.getUserSettlements);

// Get a specific settlement by ID
router.get('/:settlementId', settlementController.getSettlementById);

// Update a settlement (only notes can be updated)
router.put('/:settlementId', [
  body('notes').isString().withMessage('Notes must be a string')
], settlementController.updateSettlement);

// Get settlements between current user and a friend
router.get('/friend/:friendId', settlementController.getSettlementsWithFriend);

// Get settlements for a group
router.get('/group/:groupId', settlementController.getGroupSettlements);

// Delete a settlement
router.delete('/:id', settlementController.deleteSettlement);

module.exports = router;