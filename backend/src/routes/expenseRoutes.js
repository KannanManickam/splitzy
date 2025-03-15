const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

router.post('/', 
  auth,
  [
    body('description').notEmpty().trim(),
    body('amount').isNumeric(),
    body('date').isISO8601().toDate(),
    body('paidBy').notEmpty(),
    body('splitBetween').isArray()
  ],
  expenseController.createExpense
);

router.get('/', auth, expenseController.getExpenses);
router.get('/:expenseId', auth, expenseController.getExpense);
router.put('/:expenseId', auth, expenseController.updateExpense);
router.delete('/:expenseId', auth, expenseController.deleteExpense);

module.exports = router;
