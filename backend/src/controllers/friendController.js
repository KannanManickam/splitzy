const { validationResult } = require('express-validator');
const models = require('../models');

// Send friend request
const sendFriendRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { friend_id } = req.body;
    const user_id = req.user.id;

    // Check if friend request already exists
    const existingRequest = await models.Friend.findOne({
      where: {
        user_id,
        friend_id,
      }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Create friend request
    const friendRequest = await models.Friend.create({
      user_id,
      friend_id,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendRequest
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error while sending friend request' });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const friendRequest = await models.Friend.findOne({
      where: {
        id: requestId,
        friend_id: userId,
        status: 'pending'
      }
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Update friend request status
    await friendRequest.update({ status: 'accepted' });

    res.json({
      message: 'Friend request accepted successfully',
      friendRequest
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error while accepting friend request' });
  }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const friendRequest = await models.Friend.findOne({
      where: {
        id: requestId,
        friend_id: userId,
        status: 'pending'
      }
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Update friend request status
    await friendRequest.update({ status: 'rejected' });

    res.json({
      message: 'Friend request rejected successfully',
      friendRequest
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error while rejecting friend request' });
  }
};

// Get friend list
const getFriends = async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await models.Friend.findAll({
      where: {
        [models.Sequelize.Op.or]: [
          { user_id: userId },
          { friend_id: userId }
        ],
        status: 'accepted'
      },
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: models.User,
          as: 'friend',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const formattedFriends = friends.map(friendship => {
      const isFriend = friendship.friend_id === userId;
      const friendUser = isFriend ? friendship.user : friendship.friend;
      return {
        id: friendUser.id, // Return the actual user ID instead of friendship ID
        name: friendUser.name,
        email: friendUser.email
      };
    });

    res.json(formattedFriends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error while fetching friends' });
  }
};

// Get pending friend requests
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingRequests = await models.Friend.findAll({
      where: {
        friend_id: userId,
        status: 'pending'
      },
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    const formattedRequests = pendingRequests.map(request => ({
      id: request.id,
      name: request.user.name,
      email: request.user.email
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error while fetching pending requests' });
  }
};

// Get sent friend requests
const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const sentRequests = await models.Friend.findAll({
      where: {
        user_id: userId,
        status: 'pending'
      },
      include: [{
        model: models.User,
        as: 'friend',
        attributes: ['id', 'name', 'email']
      }]
    });

    const formattedRequests = sentRequests.map(request => ({
      id: request.id,
      name: request.friend.name,
      email: request.friend.email
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error while fetching sent requests' });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests
};