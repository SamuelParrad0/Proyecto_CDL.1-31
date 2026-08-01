const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {

  Id_Usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  Nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre no puede estar vacío' },
      len: { args: [2, 100], msg: 'Debe tener entre 2 y 100 caracteres' }
    }
  },

  Apellidos: {
    type: DataTypes.STRING(100),
    allowNull: true
  },

  Celular: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9+\-\s()]*$/,
        msg: 'El celular contiene caracteres inválidos'
      }
    }
  },

  Correo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Este correo ya está registrado'
    },
    validate: {
      isEmail: { msg: 'Debe ser un correo válido' },
      notEmpty: { msg: 'El correo no puede estar vacío' }
    }
  },

  Contraseña: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La contraseña no puede estar vacía' },
      len: { args: [6, 255], msg: 'Mínimo 6 caracteres' }
    }
  },

  Id_Rol: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  Activo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  }

}, {
  tableName: 'usuarios',
  timestamps: false, // ⚠️ tu BD no tiene createdAt ni updatedAt

  defaultScope: {
    attributes: { exclude: ['Contraseña'] }
  },

  scopes: {
    withPassword: {
      attributes: {}
    }
  },

  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.Contraseña) {
        const salt = await bcrypt.genSalt(10);
        usuario.Contraseña = await bcrypt.hash(usuario.Contraseña, salt);
      }
    },

    beforeUpdate: async (usuario) => {
      if (usuario.changed('Contraseña')) {
        const salt = await bcrypt.genSalt(10);
        usuario.Contraseña = await bcrypt.hash(usuario.Contraseña, salt);
      }
    }
  }
});

// ==========================================
// MÉTODOS
// ==========================================

Usuario.prototype.compararPassword = async function(passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.Contraseña);
};

Usuario.prototype.toJSON = function() {
  const valores = Object.assign({}, this.get());
  delete valores.Contraseña;
  return valores;
};

module.exports = Usuario;