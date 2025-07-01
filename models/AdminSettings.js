const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminSettings = sequelize.define('AdminSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  value: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'admin_settings',
  timestamps: true,
});

module.exports = AdminSettings; 