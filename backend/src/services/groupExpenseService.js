const models = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Create a new expense for a group
 */
async function createGroupExpense(expenseData, userId) {
  try {
    // Check if the user is a member of the group
    const isMember = await models.GroupMember.findOne({
      where: {
        group_id: expenseData.group_id,
        user_id: userId
      }
    });
    
    if (!isMember) {
      throw new Error('User is not a member of this group');
    }
    
    // Create the expense
    const expense = await models.Expense.create({
      description: expenseData.description,
      amount: expenseData.amount,
      date: expenseData.date || new Date(),
      split_type: expenseData.split_type || 'equal',
      created_by: userId, // Current user is the creator
      paid_by: expenseData.paid_by || userId, // Who paid for it (defaults to creator)
      group_id: expenseData.group_id
    });
    
    // If split type is equal, divide the expense equally among specified members
    if (expense.split_type === 'equal') {
      // Default to all group members if splitBetween is not specified
      let splitBetweenMembers = expenseData.split_between;
      
      if (!splitBetweenMembers || splitBetweenMembers.length === 0) {
        // Get all group members if none specified
        const groupMembers = await models.GroupMember.findAll({
          where: {
            group_id: expenseData.group_id
          },
          attributes: ['user_id']
        });
        
        splitBetweenMembers = groupMembers.map(member => member.user_id);
      }
      
      // Calculate equal share
      const perPersonAmount = parseFloat(expense.amount) / splitBetweenMembers.length;
      
      // Create expense shares for each member
      await Promise.all(splitBetweenMembers.map(userId => {
        return models.ExpenseShare.create({
          expense_id: expense.id,
          user_id: userId,
          amount: perPersonAmount.toFixed(2)
        });
      }));
    } else {
      // Handle other split types (percentage, exact) if needed
      // For now, just handle equal splitting
      throw new Error('Only equal splitting is currently supported');
    }
    
    return expense;
  } catch (error) {
    console.error('Error in createGroupExpense:', error);
    throw error;
  }
}

/**
 * Get all expenses for a group
 */
async function getGroupExpenses(groupId, userId) {
  try {
    // Check if the user is a member of the group
    const isMember = await models.GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });
    
    if (!isMember) {
      throw new Error('User is not a member of this group');
    }
    
    // Get all expenses for the group with creator, payer, and share details
    const expenses = await models.Expense.findAll({
      where: {
        group_id: groupId
      },
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'payer',
          attributes: ['id', 'name']
        },
        {
          model: models.ExpenseShare,
          as: 'shares',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['date', 'DESC']]
    });
    
    return expenses;
  } catch (error) {
    console.error('Error in getGroupExpenses:', error);
    throw error;
  }
}

/**
 * Calculate balances within a group
 */
async function calculateGroupBalances(groupId) {
  // Get all expenses for this group
  const expenses = await models.Expense.findAll({
    where: { group_id: groupId },
    include: [
      {
        model: models.User,
        as: 'payer',
        attributes: ['id', 'name', 'email']
      },
      {
        model: models.ExpenseShare,
        as: 'shares',
        include: [
          {
            model: models.User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      }
    ]
  });

  // Initialize balance map
  const balances = {};

  // Process all expenses
  expenses.forEach(expense => {
    const payerId = expense.paid_by;
    const payerName = expense.payer.name;
    const payerEmail = expense.payer.email;

    // Initialize payer's balance if not exists
    if (!balances[payerId]) {
      balances[payerId] = {
        id: payerId,  // Changed from userId to id
        name: payerName,
        email: payerEmail,
        balance: 0
      };
    }

    // Process shares
    expense.shares.forEach(share => {
      const memberId = share.user_id;
      const memberName = share.user.name;
      const memberEmail = share.user.email;

      // Initialize member's balance if not exists
      if (!balances[memberId]) {
        balances[memberId] = {
          id: memberId,  // Changed from userId to id
          name: memberName,
          email: memberEmail,
          balance: 0
        };
      }

      if (memberId !== payerId) {
        // Member owes payer their share
        balances[memberId].balance -= parseFloat(share.amount);
        balances[payerId].balance += parseFloat(share.amount);
      }
    });
  });

  // Convert balances object to array and round values
  return Object.values(balances).map(balance => ({
    ...balance,
    balance: Math.round(balance.balance * 100) / 100
  }));
}

/**
 * Get payment suggestions for settling group balances
 */
async function getGroupSettlementSuggestions(groupId, userId) {
  try {
    // Get all balances
    const balances = await calculateGroupBalances(groupId, userId);
    
    // Separate positive and negative balances
    const positiveBalances = balances
      .filter(balance => balance.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    
    const negativeBalances = balances
      .filter(balance => balance.balance < 0)
      .sort((a, b) => a.balance - b.balance); // Most negative first
    
    // Generate payment suggestions
    const suggestions = [];
    
    let i = 0; // Index for positive balances
    let j = 0; // Index for negative balances
    
    while (i < positiveBalances.length && j < negativeBalances.length) {
      const creditor = positiveBalances[i];
      const debtor = negativeBalances[j];
      
      // Calculate payment amount (minimum of what is owed and what is due)
      const paymentAmount = Math.min(
        creditor.balance,
        Math.abs(debtor.balance)
      );
      
      // Round to 2 decimal places
      const roundedAmount = Math.round(paymentAmount * 100) / 100;
      
      if (roundedAmount > 0) {
        suggestions.push({
          from: {
            id: debtor.id,  // Changed from userId to id
            name: debtor.name,
            email: debtor.email
          },
          to: {
            id: creditor.id,  // Changed from userId to id
            name: creditor.name,
            email: creditor.email
          },
          amount: roundedAmount
        });
      }
      
      // Update balances
      creditor.balance -= roundedAmount;
      debtor.balance += roundedAmount;
      
      // Move to next person if their balance is settled
      if (Math.abs(creditor.balance) < 0.01) {
        i++;
      }
      if (Math.abs(debtor.balance) < 0.01) {
        j++;
      }
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error in getGroupSettlementSuggestions:', error);
    throw error;
  }
}

/**
 * Update an existing group expense
 */
async function updateGroupExpense(groupId, expenseId, expenseData, userId) {
  try {
    // Check if the user is a member of the group
    const isMember = await models.GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });
    
    if (!isMember) {
      throw new Error('User is not a member of this group');
    }
    
    // Get the expense and verify it exists and belongs to the group
    const expense = await models.Expense.findOne({
      where: { 
        id: expenseId, 
        group_id: groupId 
      }
    });
    
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    // Update the expense
    await expense.update({
      description: expenseData.description,
      amount: expenseData.amount,
      date: expenseData.date,
      paid_by: expenseData.paid_by
    });
    
    // Update expense shares if split_between is provided
    if (expenseData.split_between && expenseData.split_between.length > 0) {
      // Delete existing shares
      await models.ExpenseShare.destroy({
        where: { expense_id: expenseId }
      });
      
      // Calculate equal share amount
      const perPersonAmount = parseFloat(expenseData.amount) / expenseData.split_between.length;
      
      // Create new shares
      await Promise.all(expenseData.split_between.map(userId =>
        models.ExpenseShare.create({
          expense_id: expenseId,
          user_id: userId,
          amount: perPersonAmount.toFixed(2)
        })
      ));
    }
    
    // Return the updated expense with all related data
    const updatedExpense = await models.Expense.findOne({
      where: { id: expenseId },
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'payer',
          attributes: ['id', 'name']
        },
        {
          model: models.ExpenseShare,
          as: 'shares',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });
    
    return updatedExpense;
  } catch (error) {
    console.error('Error in updateGroupExpense:', error);
    throw error;
  }
}

/**
 * Delete a group expense
 */
async function deleteGroupExpense(groupId, expenseId, userId) {
  try {
    // Check if the user is a member of the group
    const isMember = await models.GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });
    
    if (!isMember) {
      throw new Error('User is not a member of this group');
    }
    
    // Get the expense and verify it exists and belongs to the group
    const expense = await models.Expense.findOne({
      where: { 
        id: expenseId, 
        group_id: groupId 
      }
    });
    
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    // Verify user is the creator of the expense
    if (expense.created_by !== userId) {
      throw new Error('Only the creator can delete this expense');
    }
    
    // Delete expense shares first (due to foreign key constraints)
    await models.ExpenseShare.destroy({
      where: { expense_id: expenseId }
    });
    
    // Delete the expense
    await expense.destroy();
  } catch (error) {
    console.error('Error in deleteGroupExpense:', error);
    throw error;
  }
}

module.exports = {
  createGroupExpense,
  getGroupExpenses,
  calculateGroupBalances,
  getGroupSettlementSuggestions,
  updateGroupExpense,
  deleteGroupExpense
};