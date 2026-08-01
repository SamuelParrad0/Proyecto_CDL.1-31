const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Direccion = sequelize.define('Direccion', {

  Id_Direccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  Id_Usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'Id_Usuario'
    }
  },

  Nombre_Completo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  Departamento: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Municipio_Localidad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Barrio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Apart_Casa: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  Telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  Indicaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  Residencia_Laboral: {
    type: DataTypes.STRING(50),
    allowNull: true
  }

}, {
  tableName: 'direccion',
  timestamps: false
});

module.exports = Direccion;
