const { validationResult } = require('express-validator');
const models = require('../models');

const createGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category = 'Other', members = [] } = req.body;
    const now = new Date();

    // Log request data for debugging
    console.log('Creating group with data:', { name, description, category, members });

    // Remove duplicates from members array
    const uniqueMembers = [...new Set(members)];

    // Start a transaction
    const result = await models.sequelize.transaction(async (t) => {
      const group = await models.Group.create({
        name,
        description,
        category,
        created_by: req.user.id,
        created_at: now,
        updated_at: now
      }, { transaction: t });

      // Add creator as a member with ADMIN role
      await models.GroupMember.create({
        group_id: group.id,
        user_id: req.user.id,
        role: 'ADMIN',
        created_at: now,
        updated_at: now
      }, { transaction: t });

      // Add other members
      if (uniqueMembers.length > 0) {
        const memberPromises = uniqueMembers
          .filter(memberId => memberId !== req.user.id) // Exclude creator as they're already added
          .map(memberId => 
            models.GroupMember.create({
              group_id: group.id,
              user_id: memberId,
              role: 'MEMBER',
              created_at: now,
              updated_at: now
            }, { transaction: t })
          );
        
        await Promise.all(memberPromises);
      }

      // Fetch the complete group with members
      const completeGroup = await models.Group.findByPk(group.id, {
        include: [
          {
            model: models.User,
            as: 'members',
            through: { attributes: [] },
            attributes: ['id', 'name', 'email']
          }
        ],
        transaction: t
      });

      // Format the response to match frontend expectations
      return {
        id: completeGroup.id,
        name: completeGroup.name,
        category: completeGroup.category,
        description: completeGroup.description,
        memberCount: completeGroup.members.length,
        totalBalance: 0, // New groups start with 0 balance
        members: completeGroup.members.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email
        }))
      };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Group creation error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Some members are already part of this group' });
    }
    
    // More specific error handling
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'One or more member IDs are invalid' });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Server error during group creation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getGroups = async (req, res) => {
  try {
    // First find all groups where the user is a member
    const userGroups = await models.GroupMember.findAll({
      where: {
        user_id: req.user.id
      },
      attributes: ['group_id']
    });

    const groupIds = userGroups.map(ug => ug.group_id);

    // Then fetch full group details including all members
    const groups = await models.Group.findAll({
      where: {
        id: groupIds
      },
      include: [
        {
          model: models.User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.Expense,
          as: 'expenses',
          attributes: ['amount']
        }
      ]
    });

    // Format the response to match frontend expectations
    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      category: group.category,
      description: group.description,
      memberCount: group.members.length,
      created_by: group.created_by,
      totalBalance: group.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
      members: group.members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email
      }))
    }));

    res.json(formattedGroups);
  } catch (error) {
    console.error('Groups fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching groups' });
  }
};

const getGroupDetails = async (req, res) => {
  try {
    const group = await models.Group.findByPk(req.params.groupId, {
      include: [
        {
          model: models.User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.Expense,
          as: 'expenses',
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
                attributes: ['id', 'name', 'email']
              }]
            }
          ]
        }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member of the group
    const isMember = await group.hasMember(req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(group);
  } catch (error) {
    console.error('Group details fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching group details' });
  }
};

const addMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const { groupId } = req.params;

    const group = await models.Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the group creator
    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only group creator can add members' });
    }

    const userToAdd = await models.User.findOne({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMember = await group.hasMember(userToAdd.id);
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    await models.sequelize.transaction(async (t) => {
      await models.GroupMember.create({
        group_id: groupId,
        user_id: userToAdd.id,
        role: 'MEMBER',
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction: t });
    });

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add member error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }
    res.status(500).json({ message: 'Server error while adding member' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await models.Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the group creator
    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only group creator can remove members' });
    }

    const isMember = await group.hasMember(userId);
    if (!isMember) {
      return res.status(400).json({ message: 'User is not a member' });
    }

    // Prevent removing the creator
    if (userId === group.created_by) {
      return res.status(400).json({ message: 'Cannot remove group creator' });
    }

    await group.removeMember(userId);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error while removing member' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await models.Group.findByPk(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the group creator
    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only group creator can delete the group' });
    }

    // Delete group members first due to foreign key constraint
    await models.GroupMember.destroy({
      where: {
        group_id: group.id
      }
    });

    // Delete associated expenses
    const expenses = await models.Expense.findAll({
      where: { group_id: group.id }
    });

    // Delete expense shares and expenses
    await Promise.all(expenses.map(async (expense) => {
      await models.ExpenseShare.destroy({
        where: { expense_id: expense.id }
      });
      await expense.destroy();
    }));

    // Finally delete the group
    await group.destroy();
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Group deletion error:', error);
    res.status(500).json({ message: 'Server error while deleting group' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const group = await models.Group.findByPk(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the group creator
    if (group.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only group creator can update the group' });
    }

    const { name, description, category, members } = req.body;

    await models.sequelize.transaction(async (t) => {
      // Update group basic details
      await group.update({
        name,
        description,
        category,
        updated_at: new Date()
      }, { transaction: t });

      // Get current group members
      const currentMembers = await models.GroupMember.findAll({
        where: { group_id: group.id },
        transaction: t
      });

      const currentMemberIds = currentMembers.map(m => m.user_id);
      const newMemberIds = members.map(m => m.id || m);

      // Find members to remove and add
      const membersToRemove = currentMemberIds.filter(
        id => id !== group.created_by && !newMemberIds.includes(id)
      );
      const membersToAdd = newMemberIds.filter(
        id => id !== group.created_by && !currentMemberIds.includes(id)
      );

      // Remove members that are no longer in the group
      if (membersToRemove.length > 0) {
        await models.GroupMember.destroy({
          where: {
            group_id: group.id,
            user_id: membersToRemove
          },
          transaction: t
        });
      }

      // Add new members
      if (membersToAdd.length > 0) {
        await Promise.all(
          membersToAdd.map(userId =>
            models.GroupMember.create({
              group_id: group.id,
              user_id: userId,
              role: 'MEMBER',
              created_at: new Date(),
              updated_at: new Date()
            }, { transaction: t })
          )
        );
      }
    });

    // Fetch updated group with all details
    const updatedGroup = await models.Group.findByPk(group.id, {
      include: [
        {
          model: models.User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.Expense,
          as: 'expenses',
          attributes: ['amount']
        }
      ]
    });

    // Format the response
    const formattedGroup = {
      id: updatedGroup.id,
      name: updatedGroup.name,
      category: updatedGroup.category,
      description: updatedGroup.description,
      memberCount: updatedGroup.members.length,
      created_by: updatedGroup.created_by,
      totalBalance: updatedGroup.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
      members: updatedGroup.members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email
      }))
    };

    res.json(formattedGroup);
  } catch (error) {
    console.error('Group update error:', error);
    res.status(500).json({ message: 'Server error while updating group' });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupDetails,
  addMember,
  removeMember,
  deleteGroup,
  updateGroup
};