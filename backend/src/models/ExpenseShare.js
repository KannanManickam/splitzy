const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ExpenseShare extends Model {
    static associate(models) {
      ExpenseShare.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      ExpenseShare.belongsTo(models.Expense, {
        foreignKey: 'expense_id',
        as: 'expense'
      });
    }
  }

  ExpenseShare.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    expense_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'expenses',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    modelName: 'ExpenseShare',
    tableName: 'expense_shares',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ExpenseShare;
};