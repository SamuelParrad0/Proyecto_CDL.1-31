/**
 * MODELO PERSONALIZADO — Coincide con tabla `personalizado` de la BD
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Personalizado = sequelize.define('Personalizado', {

  Id_Personalizado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  Id_Usuario: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'Id_Usuario'
    }
  },

  Nombre_Completo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Correo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Numero_Telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },

  Destinatario: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Descripcion_Idea: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  Elementos_Esenciales: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  Prioridad_Cliente: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  Comentarios_Adicionales: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  Estado_Personalizado: {
    type: DataTypes.STRING(50),
    defaultValue: 'pendiente'
  },

  Fecha_Solicitud: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: 'personalizado',
  timestamps: false
});

module.exports = Personalizado;