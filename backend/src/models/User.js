const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.hasMany(models.Group, {
        foreignKey: 'created_by',
        as: 'created_groups'
      });
      User.belongsToMany(models.Group, {
        through: 'UserGroups',
        as: 'groups'
      });
      User.hasMany(models.Expense, {
        foreignKey: 'created_by',
        as: 'expenses'
      });
      // Friend associations
      User.belongsToMany(models.User, {
        through: models.Friend,
        as: 'friends',
        foreignKey: 'user_id',
        otherKey: 'friend_id',
        timestamps: true,
        underscored: true,
        scope: {
          status: 'accepted'
        }
      });
      User.belongsToMany(models.User, {
        through: models.Friend,
        as: 'friendRequests',
        foreignKey: 'friend_id',
        otherKey: 'user_id',
        timestamps: true,
        underscored: true,
        scope: {
          status: 'pending'
        }
      });
      // Add sent friend requests association
      User.belongsToMany(models.User, {
        through: models.Friend,
        as: 'sentFriendRequests',
        foreignKey: 'user_id',
        otherKey: 'friend_id',
        timestamps: true,
        underscored: true,
        scope: {
          status: 'pending'
        }
      });
    }

    // Generate JWT token
    generateToken() {
      return jwt.sign(
        { id: this.id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
    }

    // Compare password
    async comparePassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};