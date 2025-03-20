const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Settlement extends Model {
    static associate(models) {
      Settlement.belongsTo(models.User, {
        foreignKey: 'payer_id',
        as: 'payer'
      });
      
      Settlement.belongsTo(models.User, {
        foreignKey: 'receiver_id',
        as: 'receiver'
      });
      
      // Optional association with a group
      Settlement.belongsTo(models.Group, {
        foreignKey: 'group_id',
        as: 'group'
      });
    }
  }

  Settlement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    payer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'groups',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    sequelize,
    modelName: 'Settlement',
    tableName: 'settlements',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Settlement;
};