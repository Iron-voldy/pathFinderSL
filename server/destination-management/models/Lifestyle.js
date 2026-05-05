const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Lifestyle = sequelize.define(
  'Lifestyle',
  {
    lifestyle_id:             { type: DataTypes.INTEGER,       primaryKey: true, autoIncrement: true },
    lifestyle_city:           { type: DataTypes.STRING(255),   allowNull: true },
    lifestyle_attraction_type:{ type: DataTypes.STRING(255),   allowNull: true },
    lifestyle_name:           { type: DataTypes.STRING(255),   allowNull: true },
    lifestyle_description:    { type: DataTypes.TEXT,          allowNull: true },
    sub_description:          { type: DataTypes.TEXT,          allowNull: true },
    latitude:                 { type: DataTypes.STRING(45),    allowNull: true },
    longitude:                { type: DataTypes.STRING(45),    allowNull: true },
    address:                  { type: DataTypes.STRING(500),   allowNull: true },
    micro_location:           { type: DataTypes.STRING(255),   allowNull: true },
    image:                    { type: DataTypes.TEXT,          allowNull: true },
    active_status:            { type: DataTypes.TINYINT,       allowNull: true, defaultValue: 1 },
    preferred:                { type: DataTypes.STRING(5),     allowNull: true },
    selling_points:           { type: DataTypes.TEXT,          allowNull: true },
    adult_rate:               { type: DataTypes.DECIMAL(10,2), allowNull: true },
    child_rate:               { type: DataTypes.DECIMAL(10,2), allowNull: true },
    currency:                 { type: DataTypes.STRING(10),    allowNull: true },
    category1:                { type: DataTypes.STRING(20),    allowNull: true },
    category2:                { type: DataTypes.STRING(20),    allowNull: true },
    category3:                { type: DataTypes.STRING(20),    allowNull: true },
    category4:                { type: DataTypes.STRING(20),    allowNull: true },
    deleted_at:               { type: DataTypes.DATE,          allowNull: true },
  },
  {
    tableName: 'tbl_lifestyle',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
  }
);

module.exports = Lifestyle;
