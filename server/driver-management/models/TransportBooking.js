const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TransportBooking = sequelize.define(
  'TransportBooking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    gig_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User ID of the client who booked',
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User ID of the driver',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    passenger_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pickup_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    dropoff_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'LKR',
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'transport_bookings',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['gig_id'] },
      { fields: ['client_id'] },
      { fields: ['driver_id'] },
      { fields: ['status'] },
      { fields: ['start_date'] },
    ],
  }
);

module.exports = TransportBooking;
