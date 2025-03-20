const { validationResult } = require('express-validator');
const settlementService = require('../services/settlementService');
const models = require('../models');

/**
 * Create a new settlement
 */
async function createSettlement(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const settlementData = {
      payer_id: req.body.payer_id,
      receiver_id: req.body.receiver_id,
      amount: parseFloat(req.body.amount),
      date: req.body.date || new Date(),
      notes: req.body.notes || null,
      group_id: req.body.group_id || null
    };

    // Validate that the user is involved in the settlement (either payer or receiver)
    if (settlementData.payer_id !== req.user.id && settlementData.receiver_id !== req.user.id) {
      return res.status(403).json({ message: 'You must be involved in the settlement' });
    }

    const settlement = await settlementService.createSettlement(settlementData);

    return res.status(201).json({
      success: true,
      message: 'Settlement created successfully',
      data: settlement
    });
  } catch (error) {
    console.error('Error creating settlement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create settlement',
      error: error.message
    });
  }
}

/**
 * Get all settlements for a user
 */
async function getUserSettlements(req, res) {
  try {
    const userId = req.user.id;
    const settlements = await settlementService.getUserSettlements(userId);

    return res.status(200).json({
      success: true,
      data: settlements
    });
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch settlements',
      error: error.message
    });
  }
}

/**
 * Get a specific settlement by ID
 */
async function getSettlementById(req, res) {
  try {
    const userId = req.user.id;
    const { settlementId } = req.params;

    const settlement = await settlementService.getSettlementById(settlementId, userId);

    return res.status(200).json({
      success: true,
      data: settlement
    });
  } catch (error) {
    console.error('Error fetching settlement:', error);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to fetch settlement',
      error: error.message
    });
  }
}

/**
 * Update an existing settlement
 */
async function updateSettlement(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { settlementId } = req.params;
    const settlementData = {
      notes: req.body.notes
    };

    const settlement = await settlementService.updateSettlement(
      settlementId,
      settlementData,
      userId
    );

    return res.status(200).json({
      success: true,
      message: 'Settlement updated successfully',
      data: settlement
    });
  } catch (error) {
    console.error('Error updating settlement:', error);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to update settlement',
      error: error.message
    });
  }
}

/**
 * Get settlements between the current user and a specific friend
 */
async function getSettlementsWithFriend(req, res) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const balanceData = await settlementService.getNetBalanceWithSettlements(userId, friendId);

    return res.status(200).json({
      success: true,
      data: balanceData
    });
  } catch (error) {
    console.error('Error fetching settlements with friend:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch settlements with friend',
      error: error.message
    });
  }
}

/**
 * Get settlements for a specific group
 */
async function getGroupSettlements(req, res) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    const settlements = await settlementService.getGroupSettlements(groupId, userId);

    return res.status(200).json({
      success: true,
      data: settlements
    });
  } catch (error) {
    console.error('Error fetching group settlements:', error);
    return res.status(error.message.includes('not a member') ? 403 : 500).json({
      success: false,
      message: 'Failed to fetch group settlements',
      error: error.message
    });
  }
}

/**
 * Delete a settlement
 */
const deleteSettlement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the settlement and ensure the user is either the payer or receiver
    const settlement = await models.Settlement.findOne({
      where: {
        id,
        [models.Sequelize.Op.or]: [
          { payer_id: userId },
          { receiver_id: userId }
        ]
      }
    });

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found or you do not have permission to delete it'
      });
    }

    // Delete the settlement
    await settlement.destroy();

    res.json({
      success: true,
      message: 'Settlement deleted successfully'
    });
  } catch (error) {
    console.error('Delete settlement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting settlement'
    });
  }
};

module.exports = {
  createSettlement,
  getUserSettlements,
  getSettlementById,
  updateSettlement,
  getSettlementsWithFriend,
  getGroupSettlements,
  deleteSettlement
};