const express = require('express');
const router = express.Router();
const groupExpenseController = require('../controllers/groupExpenseController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new expense for a group
router.post('/:groupId/expenses', groupExpenseController.createGroupExpense);

// Get all expenses for a group
router.get('/:groupId/expenses', groupExpenseController.getGroupExpenses);

// Update a group expense
router.put('/:groupId/expenses/:expenseId', groupExpenseController.updateGroupExpense);

// Delete a group expense
router.delete('/:groupId/expenses/:expenseId', groupExpenseController.deleteGroupExpense);

// Get balances for a group
router.get('/:groupId/balances', groupExpenseController.getGroupBalances);

// Get settlement suggestions for a group
router.get('/:groupId/settlements', groupExpenseController.getGroupSettlementSuggestions);

module.exports = router;