const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Paquete = sequelize.define('Paquete', {

  Id_Paquete: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  Activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  Nombre_Paquete: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Descripcion_Paquete: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  Precio_Paquete: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },

  Imagen_Paquete: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  Id_Imagen: {
    type: DataTypes.INTEGER,
    allowNull: true
  }

}, {
  tableName: 'paquetes',
  timestamps: false
});

module.exports = Paquete;
