const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CartItem = sequelize.define(
  'CartItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_type: {
      type: DataTypes.ENUM('hotel', 'lifestyle'),
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    item_image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    check_in: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    check_out: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    event_date: {
      type: DataTypes.DATEONLY,
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
    unit_price: {
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
  },
  {
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
  }
);

module.exports = CartItem;
