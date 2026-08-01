const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReservaPaquete = sequelize.define('ReservaPaquete', {

  Id_Reserva_Paquete: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  Id_Paquete: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  Id_Usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  Nombre_Completo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  Correo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  Numero_Telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  Tipo_Evento: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  Fecha_Evento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  Fecha_Reserva: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },

  Numero_Invitados: {
    type: DataTypes.INTEGER
  },

  Informacion_Adicional: {
    type: DataTypes.TEXT
  },

  Estado_Reserva_Paquete: {
    type: DataTypes.STRING(50),
    defaultValue: 'pendiente'
  },

  Precio_Total: {
    type: DataTypes.DECIMAL(10,2)
  }

}, {
  tableName: 'reserva_paquetes',
  timestamps: false
});

module.exports = ReservaPaquete;