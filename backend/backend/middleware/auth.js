const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
const { normalizarRol } = require('../utils/roles');

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Acceso denegado. Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.scope('withPassword').findByPk(decoded.id, {
      attributes: { exclude: ['Contraseña'] },
      include: {
        model: Rol,
        as: 'Rol',
        attributes: ['Nombre_Rol']
      }
    });

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Token inválido o usuario no encontrado'
      });
    }

    // Adjuntar datos al request
    req.usuario = usuario;
    req.usuarioId = usuario.Id_Usuario;
    req.usuarioRol = normalizarRol(usuario.Rol ? usuario.Rol.Nombre_Rol : null);

    next();

  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido o expirado'
    });
  }
};

module.exports = { verificarToken };