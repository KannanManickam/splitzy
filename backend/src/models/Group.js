const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
      Group.belongsToMany(models.User, {
        through: models.GroupMember,
        foreignKey: 'group_id',
        otherKey: 'user_id',
        as: 'members'
      });
      Group.hasMany(models.Expense, {
        foreignKey: 'group_id',
        as: 'expenses'
      });
    }
  }

  Group.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('Home', 'Trip', 'Other'),
      defaultValue: 'Other'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
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
    modelName: 'Group',
    underscored: true,
    timestamps: true
  });

  return Group;
};