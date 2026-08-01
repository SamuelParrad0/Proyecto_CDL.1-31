const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
  Id_Producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  Activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  Nombre_Producto: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Descripcion_Producto: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Precio_Producto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  Imagen_Producto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Id_Imagen: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Id_Categoria: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'categorias', key: 'Id_Categoria' }
  },
  Stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'productos',
  timestamps: false
});

Producto.prototype.obtenerUrlImagen = function () {
  if (!this.Imagen_Producto) return null;
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${this.Imagen_Producto}`;
};

module.exports = Producto;