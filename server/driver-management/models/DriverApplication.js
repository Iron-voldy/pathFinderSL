const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const DriverApplication = sequelize.define(
  'DriverApplication',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driving_license_front: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'URL of driving license front image',
    },
    driving_license_back: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL of driving license back image',
    },
    vehicle_type: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'e.g. Sedan, SUV, Tour Bus',
    },
    vehicle_make: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'e.g. Toyota, Honda',
    },
    vehicle_model: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'e.g. Prius, CR-V',
    },
    vehicle_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vehicle_plate: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    vehicle_color: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    passenger_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vehicle_images: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of image URLs',
      get() {
        const raw = this.getDataValue('vehicle_images');
        try {
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      },
      set(val) {
        this.setDataValue('vehicle_images', Array.isArray(val) ? JSON.stringify(val) : val);
      },
    },
    vehicle_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Admin user ID who reviewed',
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'driver_applications',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  }
);

module.exports = DriverApplication;
