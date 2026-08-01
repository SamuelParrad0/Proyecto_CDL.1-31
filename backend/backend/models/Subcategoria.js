const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subcategoria = sequelize.define('Subcategoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre no puede estar vacío'
      },
      len: {
        args: [2, 100],
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    validate: {
      notNull: {
        msg: 'Debe seleccionar una categoría'
      }
    }
  },

  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }

}, {
  tableName: 'subcategorias',
  timestamps: true,

  indexes: [
    {
      fields: ['categoriaId']
    },
    {
      unique: true,
      fields: ['nombre', 'categoriaId']
    }
  ],

  hooks: {

    // Validar categoría antes de crear
    beforeCreate: async (subcategoria) => {
      const Categoria = require('./Categoria');

      const categoria = await Categoria.findByPk(subcategoria.categoriaId);

      if (!categoria) {
        throw new Error('La categoría no existe');
      }

      if (!categoria.activo) {
        throw new Error('No puedes crear subcategorías en una categoría inactiva');
      }
    },

    // Desactivar productos si la subcategoría se desactiva
    afterUpdate: async (subcategoria) => {
      if (subcategoria.changed('activo') && !subcategoria.activo) {
        const Producto = require('./Producto');

        const productos = await Producto.findAll({
          where: { subcategoriaId: subcategoria.id }
        });

        for (const producto of productos) {
          await producto.update({ activo: false });
        }
      }
    }

  }
});


// ============================
// MÉTODOS DE INSTANCIA
// ============================

Subcategoria.prototype.contarProductos = async function() {
  const Producto = require('./Producto');

  return await Producto.count({
    where: { subcategoriaId: this.id }
  });
};

Subcategoria.prototype.obtenerCategoria = async function() {
  const Categoria = require('./Categoria');

  return await Categoria.findByPk(this.categoriaId);
};


module.exports = Subcategoria;