const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TransportGig = sequelize.define(
  'TransportGig',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User ID of the driver',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    end_location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    vehicle_category: {
      type: DataTypes.ENUM('Small Group (1-4)', 'Medium Group (5-7)', 'Large Group (8-30+)', 'Specialized'),
      allowNull: false,
    },
    vehicle_type: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'e.g. Sedan, SUV, Tour Bus',
    },
    vehicle_make: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    vehicle_model: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    passenger_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_per_day: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'LKR',
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of image URLs',
      get() {
        const raw = this.getDataValue('images');
        try {
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      },
      set(val) {
        this.setDataValue('images', Array.isArray(val) ? JSON.stringify(val) : val);
      },
    },
    available_from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    available_to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'transport_gigs',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['driver_id'] },
      { fields: ['vehicle_category'] },
      { fields: ['status'] },
      { fields: ['start_location'] },
      { fields: ['end_location'] },
    ],
  }
);

module.exports = TransportGig;
