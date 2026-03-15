const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Cart = sequelize.define(
  'Cart',
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
    cart_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'My Cart',
    },
    status: {
      type: DataTypes.ENUM('active', 'checked_out'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    tableName: 'carts',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Cart;
