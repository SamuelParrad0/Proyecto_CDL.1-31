const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetallePedido = sequelize.define('DetallePedido', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  pedidoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pedidos',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },

  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'Id_Producto'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },

  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1
    }
  },

  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }

}, {
  tableName: 'detalle_pedidos',
  timestamps: false,

  hooks: {
    beforeCreate: (detalle) => {
      detalle.subtotal = parseFloat(detalle.precioUnitario) * detalle.cantidad;
    },

    beforeUpdate: (detalle) => {
      if (detalle.changed('precioUnitario') || detalle.changed('cantidad')) {
        detalle.subtotal = parseFloat(detalle.precioUnitario) * detalle.cantidad;
      }
    }
  }
});


// ==============================
// MÉTODOS
// ==============================

DetallePedido.prototype.calcularSubtotal = function() {
  return parseFloat(this.precioUnitario) * this.cantidad;
};

DetallePedido.prototype.obtenerProducto = async function() {
  const Producto = require('./Producto');
  return await Producto.findByPk(this.productoId);
};


// ==============================
// MÉTODOS ESTÁTICOS
// ==============================

DetallePedido.crearDesdeCarrito = async function(pedidoId, itemsCarrito) {
  const detalles = [];

  for (const item of itemsCarrito) {
    const detalle = await this.create({
      pedidoId,
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario
    });

    detalles.push(detalle);
  }

  return detalles;
};


DetallePedido.calcularTotalPedido = async function(pedidoId) {
  const detalles = await this.findAll({
    where: { pedidoId }
  });

  let total = 0;

  for (const d of detalles) {
    total += parseFloat(d.subtotal);
  }

  return total;
};


module.exports = DetallePedido;