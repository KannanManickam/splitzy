const models = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Calculate balances between a user and their friends
 * Positive balance means friend owes user
 * Negative balance means user owes friend
 */
async function getFriendBalances(userId) {
  try {
    // Find expenses where the user is the creator (paid)
    const paidExpenses = await models.Expense.findAll({
      where: { created_by: userId },
      include: [
        {
          model: models.ExpenseShare,
          as: 'shares',
          include: [{ model: models.User, as: 'user', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    // Find expenses where the user has a share (owes)
    const owedExpenses = await models.ExpenseShare.findAll({
      where: { user_id: userId },
      include: [
        { 
          model: models.Expense,
          as: 'expense',
          include: [{ model: models.User, as: 'creator', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    // Calculate balances for each friend
    const balances = {};
    
    // Process expenses where user paid
    paidExpenses.forEach(expense => {
      expense.shares.forEach(share => {
        if (share.user_id !== userId) {
          const friendId = share.user_id;
          const friendName = share.user.name;
          
          if (!balances[friendId]) {
            balances[friendId] = { 
              id: friendId, 
              name: friendName,
              email: share.user.email,
              balance: 0
            };
          }
          
          // Friend owes user
          balances[friendId].balance += parseFloat(share.amount);
        }
      });
    });

    // Process expenses where user owes
    owedExpenses.forEach(share => {
      const expense = share.expense;
      const friendId = expense.created_by;
      
      if (friendId !== userId) {
        const friendName = expense.creator.name;
        
        if (!balances[friendId]) {
          balances[friendId] = { 
            id: friendId, 
            name: friendName,
            email: expense.creator.email,
            balance: 0
          };
        }
        
        // User owes friend
        balances[friendId].balance -= parseFloat(share.amount);
      }
    });

    // Convert to array and round balances to 2 decimal places
    const balanceArray = Object.values(balances).map(balance => ({
      ...balance,
      balance: Math.round(balance.balance * 100) / 100
    }));

    return balanceArray;
  } catch (error) {
    console.error('Error calculating balances:', error);
    throw error;
  }
}

/**
 * Get detailed balance with a specific friend
 */
async function getBalanceWithFriend(userId, friendId) {
  try {
    const allBalances = await getFriendBalances(userId);
    const friendBalance = allBalances.find(balance => balance.id === friendId) || {
      id: friendId,
      balance: 0
    };
    
    // Get detailed expense history between the two users
    const expenseHistory = await getExpenseHistoryBetweenUsers(userId, friendId);
    
    return {
      balance: friendBalance.balance,
      expenseHistory
    };
  } catch (error) {
    console.error('Error calculating balance with friend:', error);
    throw error;
  }
}

/**
 * Get expense history between two users
 */
async function getExpenseHistoryBetweenUsers(userId, friendId) {
  // Expenses created by user where friend has a share
  const userCreatedExpenses = await models.Expense.findAll({
    where: { created_by: userId },
    include: [
      {
        model: models.ExpenseShare,
        as: 'shares',
        where: { user_id: friendId }
      },
      {
        model: models.User,
        as: 'creator',
        attributes: ['id', 'name']
      }
    ],
    order: [['date', 'DESC']]
  });
  
  // Expenses created by friend where user has a share
  const friendCreatedExpenses = await models.Expense.findAll({
    where: { created_by: friendId },
    include: [
      {
        model: models.ExpenseShare,
        as: 'shares',
        where: { user_id: userId }
      },
      {
        model: models.User,
        as: 'creator',
        attributes: ['id', 'name']
      }
    ],
    order: [['date', 'DESC']]
  });
  
  // Format expenses for consistent display
  const formattedUserExpenses = userCreatedExpenses.map(expense => ({
    id: expense.id,
    description: expense.description,
    date: expense.date,
    type: 'youPaid',
    totalAmount: parseFloat(expense.amount),
    friendOwes: parseFloat(expense.shares.find(share => share.user_id === friendId).amount),
    createdBy: expense.creator.name
  }));
  
  const formattedFriendExpenses = friendCreatedExpenses.map(expense => ({
    id: expense.id,
    description: expense.description,
    date: expense.date,
    type: 'friendPaid',
    totalAmount: parseFloat(expense.amount),
    youOwe: parseFloat(expense.shares.find(share => share.user_id === userId).amount),
    createdBy: expense.creator.name
  }));
  
  // Combine and sort by date
  return [...formattedUserExpenses, ...formattedFriendExpenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Generate payment suggestions for a user to settle balances
 */
async function getPaymentSuggestions(userId) {
  const balances = await getFriendBalances(userId);
  
  // Separate positive (friends owe user) and negative (user owes friends) balances
  const positiveBalances = balances.filter(balance => balance.balance > 0);
  const negativeBalances = balances.filter(balance => balance.balance < 0);
  
  // Sort by amount
  positiveBalances.sort((a, b) => b.balance - a.balance);
  negativeBalances.sort((a, b) => a.balance - b.balance);
  
  // Generate payment suggestions
  const suggestions = [];
  
  if (negativeBalances.length > 0) {
    // User needs to pay others
    suggestions.push({
      type: 'youShouldPay',
      payments: negativeBalances.map(balance => ({
        to: {
          id: balance.id,
          name: balance.name,
          email: balance.email
        },
        amount: Math.abs(balance.balance)
      }))
    });
  }
  
  if (positiveBalances.length > 0) {
    // Others need to pay user
    suggestions.push({
      type: 'youShouldReceive',
      payments: positiveBalances.map(balance => ({
        from: {
          id: balance.id,
          name: balance.name,
          email: balance.email
        },
        amount: balance.balance
      }))
    });
  }
  
  return suggestions;
}

module.exports = {
  getFriendBalances,
  getBalanceWithFriend,
  getExpenseHistoryBetweenUsers,
  getPaymentSuggestions
};