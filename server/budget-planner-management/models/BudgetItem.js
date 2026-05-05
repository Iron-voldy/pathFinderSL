const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const BudgetItem = sequelize.define(
  'BudgetItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'accommodation',
        'transport',
        'food',
        'activities',
        'shopping',
        'miscellaneous'
      ),
      allowNull: false,
      defaultValue: 'miscellaneous',
    },
    item_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimated_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    actual_cost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    item_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'budget_items',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = BudgetItem;
