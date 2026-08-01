const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Opinion = sequelize.define('Opinion', {
  Id_Reseña: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre_Usuario: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Calificacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  Comentario: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Id_Usuario: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'reseñas',
  timestamps: false
});

module.exports = Opinion;