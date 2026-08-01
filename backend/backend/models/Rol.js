const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rol = sequelize.define('Rol', {

  Id_Rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  Nombre_Rol: {
    type: DataTypes.STRING(50),
    allowNull: false
  }

}, {
  tableName: 'rol',
  timestamps: false
});

module.exports = Rol;
