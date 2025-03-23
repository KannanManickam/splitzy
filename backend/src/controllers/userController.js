const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const models = require('../models');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await models.User.create({
      name,
      email,
      password
    });
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        currency_preference: user.currency_preference,
        timezone: user.timezone,
        notification_preferences: user.notification_preferences,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await models.User.findOne({ 
      where: { email },
      attributes: [
        'id', 
        'name', 
        'email', 
        'created_at',
        'password',
        'currency_preference',
        'timezone',
        'notification_preferences',
        'profile_picture'
      ]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        currency_preference: user.currency_preference,
        timezone: user.timezone,
        notification_preferences: user.notification_preferences,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id, {
      attributes: [
        'id', 
        'name', 
        'email', 
        'created_at',
        'currency_preference',
        'timezone',
        'notification_preferences',
        'profile_picture'
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        currency_preference: user.currency_preference,
        timezone: user.timezone,
        notification_preferences: user.notification_preferences,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await models.User.findOne({
      where: { email },
      attributes: ['id', 'name', 'email']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({ message: 'Server error while looking up user' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const userId = req.user.id;

    const user = await models.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If email is being changed, check if new email is already taken
    if (email && email !== user.email) {
      const existingUser = await models.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    await user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        currency_preference: user.currency_preference,
        timezone: user.timezone,
        notification_preferences: user.notification_preferences,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currency_preference, timezone, notification_preferences } = req.body;
    const userId = req.user.id;

    const user = await models.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};
    if (currency_preference) updateData.currency_preference = currency_preference;
    if (timezone) updateData.timezone = timezone;
    if (notification_preferences) updateData.notification_preferences = notification_preferences;

    await user.update(updateData);

    res.json({
      message: 'Preferences updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        currency_preference: user.currency_preference,
        timezone: user.timezone,
        notification_preferences: user.notification_preferences,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const user = await models.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // The file path would be handled by a file upload middleware
    const profilePicturePath = req.file.path;
    await user.update({ profile_picture: profilePicturePath });

    res.json({
      message: 'Profile picture uploaded successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
        currency_preference: user.currency_preference,
        timezone: user.timezone,
        notification_preferences: user.notification_preferences,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Server error while uploading profile picture' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUserByEmail,
  updateProfile,
  updatePreferences,
  uploadProfilePicture
};