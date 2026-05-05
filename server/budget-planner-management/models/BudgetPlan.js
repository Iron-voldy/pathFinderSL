const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const BudgetPlan = sequelize.define(
  'BudgetPlan',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plan_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    total_budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'LKR',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adult_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    child_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('planning', 'active', 'completed'),
      allowNull: false,
      defaultValue: 'planning',
    },
  },
  {
    tableName: 'budget_plans',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = BudgetPlan;
