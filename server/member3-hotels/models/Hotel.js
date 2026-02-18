const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Hotel Model - Accommodation Management
 * Database: production_test4_new
 * Table: hotels (2,277 existing records)
 */
const Hotel = sequelize.define('Hotel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  hotel_name: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Name of the hotel/accommodation'
  },
  hotel_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed description of the hotel'
  },
  star_classification: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Star rating (e.g., "3-star", "5-star")'
  },
  auto_confirmation: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 0,
    comment: 'Auto-confirm bookings (0=No, 1=Yes)'
  },
  triggers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Trigger count for automated actions'
  },
  hotel_classification: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Classification type (hotel, resort, villa, etc.)'
  },
  longitude: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'GPS longitude coordinate'
  },
  latitude: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'GPS latitude coordinate'
  },
  provider: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Service provider name'
  },
  hotel_address: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Full address of the hotel'
  },
  trip_advisor_link: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'TripAdvisor profile URL'
  },
  hotel_image: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Main image URL or path'
  },
  country: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Country name'
  },
  city: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'City name'
  },
  micro_location: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Specific area or neighborhood'
  },
  hotel_status: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Status: active, inactive, pending'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Operational start date'
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Operational end date (seasonal)'
  },
  vendor_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'Reference to vendor/owner'
  },
  updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'User ID who last updated'
  },
  additional_data_1: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Extra field for custom data'
  },
  markup: {
    type: DataTypes.DECIMAL(10, 0),
    allowNull: true,
    defaultValue: 15,
    comment: 'Price markup percentage'
  },
  sub_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Short description/tagline'
  },
  temp_column: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Temporary column for migrations'
  }
}, {
  tableName: 'hotels',
  timestamps: true,
  paranoid: true, // Enables soft deletes (deleted_at)
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    // Note: TEXT columns are already indexed in the existing database
    // We don't create new indexes here to avoid conflicts
  ]
});

module.exports = Hotel;
