const { validationResult } = require('express-validator');
const models = require('../models');

const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Creating expense with data:', req.body);
    const { description, amount, date, paidBy, splitBetween } = req.body;

    // Create the expense with split_type
    const expense = await models.Expense.create({
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      created_by: req.user.id, // Set creator as current user instead of who paid
      paid_by: paidBy, // Add paid_by field
      split_type: 'equal' // Adding default split_type as 'equal'
    });

    console.log('Expense created:', expense.id);

    // Calculate share amount
    const shareAmount = parseFloat(amount) / splitBetween.length;
    console.log('Share amount per person:', shareAmount);

    // Create expense shares
    const shares = await Promise.all(splitBetween.map(userId => 
      models.ExpenseShare.create({
        expense_id: expense.id,
        user_id: userId,
        amount: shareAmount,
        is_paid: userId === paidBy // Mark as paid for the person who paid
      })
    ));

    console.log('Created expense shares:', shares.length);

    // Fetch the created expense with all details
    const expenseWithDetails = await models.Expense.findByPk(expense.id, {
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'name']
        },
        {
          model: models.User,
          as: 'payer',
          attributes: ['id', 'name']
        },
        {
          model: models.ExpenseShare,
          as: 'shares',
          include: [{
            model: models.User,
            as: 'user',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    // Format the response
    const formattedExpense = {
      id: expenseWithDetails.id,
      description: expenseWithDetails.description,
      amount: expenseWithDetails.amount,
      date: expenseWithDetails.date,
      paidBy: {
        id: expenseWithDetails.payer.id,
        name: expenseWithDetails.payer.name
      },
      createdBy: {
        id: expenseWithDetails.creator.id,
        name: expenseWithDetails.creator.name
      },
      splitBetween: expenseWithDetails.shares.map(share => ({
        id: share.user.id,
        name: share.user.name,
        amount: share.amount
      }))
    };

    res.status(201).json(formattedExpense);
  } catch (error) {
    console.error('Detailed create expense error:', error);
    res.status(500).json({
      message: 'Server error while creating expense',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    console.log('Fetching expenses for user:', req.user.id);
    
    const expenses = await models.Expense.findAll({
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'name']
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
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: models.Group,
          as: 'group',
          attributes: ['id', 'name']
        }
      ],
      where: {
        [models.Sequelize.Op.or]: [
          { created_by: req.user.id },
          {
            '$shares.user_id$': req.user.id
          }
        ]
      },
      order: [['created_at', 'DESC']],
      distinct: true, // Add distinct to prevent duplicate rows
      subQuery: false // Optimize the query performance
    });

    // Format the expenses to match the frontend expectations
    const formattedExpenses = await Promise.all(expenses.map(async expense => {
      // Get ALL shares for this expense, not just the ones for the current user
      const allShares = await models.ExpenseShare.findAll({
        where: { expense_id: expense.id },
        include: [
          {
            model: models.User,
            as: 'user',
            attributes: ['id', 'name']
          }
        ]
      });

      return {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        paidBy: {
          id: expense.payer.id,
          name: expense.payer.name
        },
        createdBy: {
          id: expense.creator.id,
          name: expense.creator.name
        },
        splitBetween: allShares.map(share => ({
          id: share.user.id,
          name: share.user.name,
          amount: share.amount
        })),
        ...(expense.group && {
          group: {
            id: expense.group.id,
            name: expense.group.name
          }
        })
      };
    }));

    console.log('Found expenses:', expenses.length);
    res.json(formattedExpenses);
  } catch (error) {
    console.error('Detailed expense fetch error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching expenses',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getExpense = async (req, res) => {
  try {
    const expense = await models.Expense.findByPk(req.params.expenseId, {
      include: [
        {
          model: models.User,
          as: 'participants',
          through: { attributes: ['amount'] },
          attributes: ['id', 'name']
        },
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'name']
        },
        {
          model: models.Group,
          as: 'group',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user has access to this expense
    const group = await models.Group.findByPk(expense.groupId);
    const isMember = await group.hasMember(req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ expense });
  } catch (error) {
    console.error('Expense fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const expense = await models.Expense.findByPk(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    // Only creator can update the expense (fixed property name to match DB column)
    if (expense.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only expense creator can update' });
    }
    
    const { description, amount, date, paidBy, splitBetween } = req.body;
    
    // Update expense basic details
    await expense.update({
      description,
      amount: parseFloat(amount),
      date: new Date(date)
    });

    // If we're changing who paid, update the created_by field
    if (paidBy !== expense.created_by) {
      await expense.update({ created_by: paidBy });
    }

    // Handle split updates if needed
    if (splitBetween && splitBetween.length > 0) {
      // Delete existing shares
      await models.ExpenseShare.destroy({
        where: { expense_id: expense.id }
      });
      
      // Calculate new share amount
      const shareAmount = parseFloat(amount) / splitBetween.length;
      
      // Create new shares
      await Promise.all(splitBetween.map(userId => 
        models.ExpenseShare.create({
          expense_id: expense.id,
          user_id: userId,
          amount: shareAmount,
          is_paid: userId === paidBy // Mark as paid for the person who paid
        })
      ));
    }

    // Fetch the updated expense with all details
    const updatedExpense = await models.Expense.findByPk(expense.id, {
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'name']
        },
        {
          model: models.User,
          as: 'payer',
          attributes: ['id', 'name']
        },
        {
          model: models.ExpenseShare,
          as: 'shares',
          include: [{
            model: models.User,
            as: 'user',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    // Format the response to match the frontend expectations
    const formattedExpense = {
      id: updatedExpense.id,
      description: updatedExpense.description,
      amount: updatedExpense.amount,
      date: updatedExpense.date,
      paidBy: {
        id: updatedExpense.payer.id,
        name: updatedExpense.payer.name
      },
      createdBy: {
        id: updatedExpense.creator.id,
        name: updatedExpense.creator.name
      },
      splitBetween: updatedExpense.shares.map(share => ({
        id: share.user.id,
        name: share.user.name,
        amount: share.amount
      }))
    };

    res.json(formattedExpense);
  } catch (error) {
    console.error('Expense update error:', error);
    res.status(500).json({ message: 'Server error during expense update' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await models.Expense.findByPk(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Only creator can delete the expense (fix property name to match DB column)
    if (expense.created_by !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete expenses you created' });
    }

    // Delete expense shares first due to foreign key constraint
    await models.ExpenseShare.destroy({
      where: {
        expense_id: expense.id
      }
    });

    // Then delete the expense
    await expense.destroy();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Expense deletion error:', error);
    res.status(500).json({ message: 'Server error during expense deletion' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense
};