const models = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Create a new settlement
 */
async function createSettlement(settlementData) {
  try {
    const settlement = await models.Settlement.create({
      payer_id: settlementData.payer_id,
      receiver_id: settlementData.receiver_id,
      amount: settlementData.amount,
      date: settlementData.date || new Date(),
      notes: settlementData.notes || null,
      group_id: settlementData.group_id || null
    });
    
    return settlement;
  } catch (error) {
    console.error('Error in createSettlement:', error);
    throw error;
  }
}

/**
 * Get settlements for a user (as payer or receiver)
 */
async function getUserSettlements(userId) {
  try {
    const settlements = await models.Settlement.findAll({
      where: {
        [Op.or]: [
          { payer_id: userId },
          { receiver_id: userId }
        ]
      },
      include: [
        {
          model: models.User,
          as: 'payer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.Group,
          as: 'group',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['date', 'DESC']]
    });
    
    return settlements;
  } catch (error) {
    console.error('Error in getUserSettlements:', error);
    throw error;
  }
}

/**
 * Get a specific settlement by ID
 */
async function getSettlementById(settlementId, userId) {
  try {
    const settlement = await models.Settlement.findOne({
      where: {
        id: settlementId,
        [Op.or]: [
          { payer_id: userId },
          { receiver_id: userId }
        ]
      },
      include: [
        {
          model: models.User,
          as: 'payer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.Group,
          as: 'group',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    
    if (!settlement) {
      throw new Error('Settlement not found or access denied');
    }
    
    return settlement;
  } catch (error) {
    console.error('Error in getSettlementById:', error);
    throw error;
  }
}

/**
 * Update an existing settlement
 */
async function updateSettlement(settlementId, settlementData, userId) {
  try {
    const settlement = await models.Settlement.findOne({
      where: {
        id: settlementId,
        [Op.or]: [
          { payer_id: userId },
          { receiver_id: userId }
        ]
      }
    });
    
    if (!settlement) {
      throw new Error('Settlement not found or access denied');
    }
    
    // Only allow updating notes field
    await settlement.update({
      notes: settlementData.notes
    });
    
    return settlement;
  } catch (error) {
    console.error('Error in updateSettlement:', error);
    throw error;
  }
}

/**
 * Get settlements between two users
 */
async function getSettlementsBetweenUsers(user1Id, user2Id) {
  try {
    const settlements = await models.Settlement.findAll({
      where: {
        [Op.or]: [
          {
            payer_id: user1Id,
            receiver_id: user2Id
          },
          {
            payer_id: user2Id,
            receiver_id: user1Id
          }
        ]
      },
      include: [
        {
          model: models.User,
          as: 'payer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'DESC']]
    });
    
    return settlements;
  } catch (error) {
    console.error('Error in getSettlementsBetweenUsers:', error);
    throw error;
  }
}

/**
 * Get settlements for a specific group
 */
async function getGroupSettlements(groupId, userId) {
  try {
    // First check if user is a member of the group
    const isMember = await models.GroupMember.findOne({
      where: {
        group_id: groupId,
        user_id: userId
      }
    });
    
    if (!isMember) {
      throw new Error('User is not a member of this group');
    }
    
    const settlements = await models.Settlement.findAll({
      where: {
        group_id: groupId
      },
      include: [
        {
          model: models.User,
          as: 'payer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'DESC']]
    });
    
    return settlements;
  } catch (error) {
    console.error('Error in getGroupSettlements:', error);
    throw error;
  }
}

/**
 * Calculate net balance between users considering settlements
 */
async function getNetBalanceWithSettlements(userId, friendId) {
  try {
    const balanceService = require('./balanceService');
    
    // Get the original balance from expenses only (no settlements)
    const expenseOnlyData = await balanceService.getExpenseOnlyBalanceWithFriend(userId, friendId);
    const originalBalance = expenseOnlyData.balance;
    
    // Get all settlements between the users
    const settlements = await getSettlementsBetweenUsers(userId, friendId);
    
    // Calculate the net change from settlements
    let settlementBalance = 0;
    
    settlements.forEach(settlement => {
      if (settlement.payer_id === userId) {
        // User paid friend, decreasing what user owes (or increasing what friend owes)
        settlementBalance += parseFloat(settlement.amount);
      } else {
        // Friend paid user, decreasing what friend owes (or increasing what user owes)
        settlementBalance -= parseFloat(settlement.amount);
      }
    });
    
    // Calculate final balance (positive: friend owes user, negative: user owes friend)
    const netBalance = originalBalance + settlementBalance;
    
    return {
      originalBalance,
      settlementBalance,
      netBalance,
      settlements
    };
  } catch (error) {
    console.error('Error in getNetBalanceWithSettlements:', error);
    throw error;
  }
}

module.exports = {
  createSettlement,
  getUserSettlements,
  getSettlementById,
  updateSettlement,
  getSettlementsBetweenUsers,
  getGroupSettlements,
  getNetBalanceWithSettlements
};