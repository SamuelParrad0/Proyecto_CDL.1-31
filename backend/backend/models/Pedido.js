const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'Id_Usuario'
    },
    onDelete: 'CASCADE'
  },

  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  estado: {
    type: DataTypes.ENUM(
      'pendiente',
      'pagado',
      'enviado',
      'entregado',
      'cancelado'
    ),
    defaultValue: 'pendiente'
  },

  direccionEnvio: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },

  notas: {
    type: DataTypes.TEXT
  }

}, {
  tableName: 'pedidos',
  timestamps: true
});


// ==============================
// MÉTODOS
// ==============================

Pedido.prototype.cambiarEstado = async function(nuevoEstado) {
  const estados = ['pendiente','pagado','enviado','entregado','cancelado'];

  if (!estados.includes(nuevoEstado)) {
    throw new Error('Estado inválido');
  }

  this.estado = nuevoEstado;
  return await this.save();
};


module.exports = Pedido;