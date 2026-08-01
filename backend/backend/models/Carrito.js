const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Carrito = sequelize.define('Carrito', {

  Id_Carrito: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  Id_Usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  Id_Producto: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  Id_Direccion: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  Cantidad_Productos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },

  Precio_Total: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  Estado_Carrito: {
    type: DataTypes.STRING(50),
    defaultValue: 'activo'
  },

  Fecha_Creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: 'carrito',
  timestamps: false
});

// MÉTODO SUBTOTAL
Carrito.prototype.calcularSubtotal = function() {
  return parseFloat(this.Precio_Total);
};

module.exports = Carrito;