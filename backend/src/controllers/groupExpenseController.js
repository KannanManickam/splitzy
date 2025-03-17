const groupExpenseService = require('../services/groupExpenseService');

/**
 * Create a new expense for a group
 */
async function createGroupExpense(req, res) {
  try {
    const userId = req.user.id;
    const expenseData = {
      description: req.body.description,
      amount: req.body.amount,
      date: req.body.date,
      split_type: req.body.split_type || 'equal',
      group_id: req.params.groupId,
      split_between: req.body.split_between || []
    };

    const expense = await groupExpenseService.createGroupExpense(expenseData, userId);
    
    return res.status(201).json({
      success: true,
      message: 'Group expense created successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error creating group expense:', error);
    return res.status(error.message === 'User is not a member of this group' ? 403 : 500).json({
      success: false,
      message: 'Failed to create group expense',
      error: error.message
    });
  }
}

/**
 * Get all expenses for a group
 */
async function getGroupExpenses(req, res) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    const expenses = await groupExpenseService.getGroupExpenses(groupId, userId);
    
    return res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Error retrieving group expenses:', error);
    return res.status(error.message === 'User is not a member of this group' ? 403 : 500).json({
      success: false,
      message: 'Failed to retrieve group expenses',
      error: error.message
    });
  }
}

/**
 * Get balances for a group
 */
async function getGroupBalances(req, res) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    const balances = await groupExpenseService.calculateGroupBalances(groupId, userId);
    
    return res.status(200).json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error('Error calculating group balances:', error);
    return res.status(error.message === 'User is not a member of this group' ? 403 : 500).json({
      success: false,
      message: 'Failed to calculate group balances',
      error: error.message
    });
  }
}

/**
 * Get settlement suggestions for a group
 */
async function getGroupSettlementSuggestions(req, res) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    const suggestions = await groupExpenseService.getGroupSettlementSuggestions(groupId, userId);
    
    return res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error generating group settlement suggestions:', error);
    return res.status(error.message === 'User is not a member of this group' ? 403 : 500).json({
      success: false,
      message: 'Failed to generate settlement suggestions',
      error: error.message
    });
  }
}

/**
 * Update an existing group expense
 */
async function updateGroupExpense(req, res) {
  try {
    const userId = req.user.id;
    const { groupId, expenseId } = req.params;
    const expenseData = {
      description: req.body.description,
      amount: req.body.amount,
      date: req.body.date,
      paid_by: req.body.paidBy,
      split_between: req.body.split_between
    };
    
    const expense = await groupExpenseService.updateGroupExpense(groupId, expenseId, expenseData, userId);
    
    return res.json({
      success: true,
      message: 'Group expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error updating group expense:', error);
    return res.status(error.message.includes('not found') ? 404 : 
      error.message.includes('not a member') ? 403 : 500).json({
      success: false,
      message: 'Failed to update group expense',
      error: error.message
    });
  }
}

/**
 * Delete a group expense
 */
async function deleteGroupExpense(req, res) {
  try {
    const userId = req.user.id;
    const { groupId, expenseId } = req.params;
    
    await groupExpenseService.deleteGroupExpense(groupId, expenseId, userId);
    
    return res.json({
      success: true,
      message: 'Group expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group expense:', error);
    return res.status(error.message.includes('not found') ? 404 : 
      error.message.includes('not a member') ? 403 : 500).json({
      success: false,
      message: 'Failed to delete group expense',
      error: error.message
    });
  }
}

module.exports = {
  createGroupExpense,
  getGroupExpenses,
  getGroupBalances,
  getGroupSettlementSuggestions,
  updateGroupExpense,
  deleteGroupExpense
};