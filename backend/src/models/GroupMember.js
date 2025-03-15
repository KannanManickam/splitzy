const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GroupMember extends Model {
    static associate(models) {
      // Define associations here
      GroupMember.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      GroupMember.belongsTo(models.Group, {
        foreignKey: 'group_id',
        as: 'group'
      });
    }
  }

  GroupMember.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Groups',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'MEMBER'),
      defaultValue: 'MEMBER'
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    modelName: 'GroupMember',
    underscored: true
  });

  return GroupMember;
};