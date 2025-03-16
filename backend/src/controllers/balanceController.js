const balanceService = require('../services/balanceService');

/**
 * Get all balances for the current user with their friends
 */
async function getFriendBalances(req, res) {
  try {
    const userId = req.user.id;
    const balances = await balanceService.getFriendBalances(userId);
    
    res.status(200).json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error('Error getting friend balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve friend balances',
      error: error.message
    });
  }
}

/**
 * Get detailed balance with a specific friend
 */
async function getBalanceWithFriend(req, res) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;
    
    const balanceDetails = await balanceService.getBalanceWithFriend(userId, friendId);
    
    res.status(200).json({
      success: true,
      data: balanceDetails
    });
  } catch (error) {
    console.error('Error getting balance with friend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve balance with friend',
      error: error.message
    });
  }
}

/**
 * Get payment suggestions for the current user
 */
async function getPaymentSuggestions(req, res) {
  try {
    const userId = req.user.id;
    const suggestions = await balanceService.getPaymentSuggestions(userId);
    
    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting payment suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment suggestions',
      error: error.message
    });
  }
}

module.exports = {
  getFriendBalances,
  getBalanceWithFriend,
  getPaymentSuggestions
};