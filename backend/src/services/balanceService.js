const models = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Calculate balances between a user and their friends
 * Positive balance means friend owes user
 * Negative balance means user owes friend
 */
async function getFriendBalances(userId) {
  try {
    // STEP 1: Calculate raw expense-based balances
    const expenseBalances = {};

    // Find expenses where the user paid
    const paidExpenses = await models.Expense.findAll({
      where: { paid_by: userId },
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
          include: [
            { 
              model: models.User, 
              as: 'payer', 
              attributes: ['id', 'name', 'email'] 
            }
          ]
        }
      ]
    });

    // Process expenses where user paid
    paidExpenses.forEach(expense => {
      expense.shares.forEach(share => {
        if (share.user_id !== userId) {
          const friendId = share.user_id;
          const friendName = share.user.name;
          
          if (!expenseBalances[friendId]) {
            expenseBalances[friendId] = { 
              id: friendId, 
              name: friendName,
              email: share.user.email,
              balance: 0
            };
          }
          
          // Friend owes user (positive balance)
          expenseBalances[friendId].balance += parseFloat(share.amount);
        }
      });
    });

    // Process expenses where user owes
    owedExpenses.forEach(share => {
      const expense = share.expense;
      const friendId = expense.paid_by;
      
      if (friendId !== userId) {
        const friendName = expense.payer.name;
        
        if (!expenseBalances[friendId]) {
          expenseBalances[friendId] = { 
            id: friendId, 
            name: friendName,
            email: expense.payer.email,
            balance: 0
          };
        }
        
        // User owes friend (negative balance)
        expenseBalances[friendId].balance -= parseFloat(share.amount);
      }
    });

    // STEP 2: Apply settlements
    // Get settlements where user is payer (sent money to friend)
    const userPaidSettlements = await models.Settlement.findAll({
      where: { payer_id: userId },
      include: [
        { 
          model: models.User, 
          as: 'receiver', 
          attributes: ['id', 'name', 'email'] 
        }
      ]
    });

    // Get settlements where user is receiver (received money from friend)
    const userReceivedSettlements = await models.Settlement.findAll({
      where: { receiver_id: userId },
      include: [
        { 
          model: models.User, 
          as: 'payer', 
          attributes: ['id', 'name', 'email'] 
        }
      ]
    });

    // Deep clone the expense balances to create the net balances
    const netBalances = JSON.parse(JSON.stringify(expenseBalances));

    // Process settlements where user paid friend 
    // (this means the user is settling a debt they owe OR friend is returning excess money)
    userPaidSettlements.forEach(settlement => {
      const friendId = settlement.receiver_id;
      const friendName = settlement.receiver.name;
      
      if (!netBalances[friendId]) {
        netBalances[friendId] = { 
          id: friendId, 
          name: friendName,
          email: settlement.receiver.email,
          balance: 0
        };
      }
      
      // When user pays friend, it typically reduces or eliminates a negative balance
      // (The user is paying what they owe)
      netBalances[friendId].balance += parseFloat(settlement.amount);
    });

    // Process settlements where user received payment from friend
    // (this means the friend is settling a debt they owe OR user is returning excess money)
    userReceivedSettlements.forEach(settlement => {
      const friendId = settlement.payer_id;
      const friendName = settlement.payer.name;
      
      if (!netBalances[friendId]) {
        netBalances[friendId] = { 
          id: friendId, 
          name: friendName,
          email: settlement.payer.email,
          balance: 0
        };
      }
      
      // When user receives payment from friend, it typically reduces or eliminates a positive balance
      // (The friend is paying what they owe)
      netBalances[friendId].balance -= parseFloat(settlement.amount);
    });

    // Convert to array and round balances to 2 decimal places
    const balanceArray = Object.values(netBalances).map(balance => ({
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
  // Get expenses where user paid and friend was involved
  const userPaidExpenses = await models.Expense.findAll({
    where: { paid_by: userId },
    include: [
      {
        model: models.ExpenseShare,
        as: 'shares',
        where: { user_id: friendId }
      },
      {
        model: models.User,
        as: 'payer',
        attributes: ['id', 'name']
      }
    ],
    order: [['date', 'DESC']]
  });
  
  // Get expenses where friend paid and user was involved
  const friendPaidExpenses = await models.Expense.findAll({
    where: { paid_by: friendId },
    include: [
      {
        model: models.ExpenseShare,
        as: 'shares',
        where: { user_id: userId }
      },
      {
        model: models.User,
        as: 'payer',
        attributes: ['id', 'name']
      }
    ],
    order: [['date', 'DESC']]
  });
  
  // Format expenses for consistent display
  const formattedUserExpenses = userPaidExpenses.map(expense => ({
    id: expense.id,
    description: expense.description,
    date: expense.date,
    type: 'youPaid',
    totalAmount: parseFloat(expense.amount),
    friendOwes: parseFloat(expense.shares.find(share => share.user_id === friendId).amount),
    paidBy: expense.payer.name
  }));
  
  const formattedFriendExpenses = friendPaidExpenses.map(expense => ({
    id: expense.id,
    description: expense.description,
    date: expense.date,
    type: 'friendPaid',
    totalAmount: parseFloat(expense.amount),
    youOwe: parseFloat(expense.shares.find(share => share.user_id === userId).amount),
    paidBy: expense.payer.name
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

/**
 * Calculate balances between a user and their friends, considering ONLY expenses (no settlements)
 * This is used by the settlement service to avoid double-counting settlements
 * Positive balance means friend owes user
 * Negative balance means user owes friend
 */
async function getExpenseOnlyBalanceWithFriend(userId, friendId) {
  try {
    // Find expenses where the user paid
    const paidExpenses = await models.Expense.findAll({
      where: { paid_by: userId },
      include: [
        {
          model: models.ExpenseShare,
          as: 'shares',
          where: { user_id: friendId },
          required: true
        }
      ]
    });

    // Find expenses where the friend paid and user has a share
    const owedExpenses = await models.ExpenseShare.findAll({
      where: { user_id: userId },
      include: [
        { 
          model: models.Expense,
          as: 'expense',
          where: { paid_by: friendId },
          required: true
        }
      ]
    });

    // Calculate balance
    let balance = 0;

    // Process expenses where user paid (friend owes user)
    paidExpenses.forEach(expense => {
      const friendShare = expense.shares.find(share => share.user_id === friendId);
      if (friendShare) {
        // Friend owes user (positive)
        balance += parseFloat(friendShare.amount);
      }
    });

    // Process expenses where user owes friend (friend paid)
    owedExpenses.forEach(share => {
      // User owes friend (negative)
      balance -= parseFloat(share.amount);
    });

    // Get expense history for the detailed view
    const expenseHistory = await getExpenseHistoryBetweenUsers(userId, friendId);
    
    return {
      balance: Math.round(balance * 100) / 100,
      expenseHistory
    };
  } catch (error) {
    console.error('Error calculating expense-only balance with friend:', error);
    throw error;
  }
}

module.exports = {
  getFriendBalances,
  getBalanceWithFriend,
  getExpenseHistoryBetweenUsers,
  getPaymentSuggestions,
  getExpenseOnlyBalanceWithFriend
};