const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {

  Id_Categoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  Nombre_Categoria: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Ya existe una categoría con ese nombre'
    }
  },

  Descripcion_Categoria: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  Activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }

}, {
  tableName: 'categorias',
  timestamps: false
});

// CONTAR PRODUCTOS
Categoria.prototype.contarProductos = async function() {
  const Producto = require('./Producto');
  return await Producto.count({
    where: { Id_Categoria: this.Id_Categoria }
  });
};

module.exports = Categoria;