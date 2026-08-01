const { normalizarRol } = require('../utils/roles');

const esAdministrador = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ ok: false, mensaje: 'No autorizado' });
  }
  const rol = normalizarRol(req.usuarioRol || (req.usuario.Rol && req.usuario.Rol.Nombre_Rol));
  if (rol !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'Acceso denegado. Se requiere rol administrador' });
  }
  next();
};

const esCliente = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ ok: false, mensaje: 'No autorizado' });
  }
  const rol = normalizarRol(req.usuarioRol || (req.usuario.Rol && req.usuario.Rol.Nombre_Rol));
  if (rol !== 'cliente') {
    return res.status(403).json({ ok: false, mensaje: 'Acceso denegado. Solo para clientes' });
  }
  next();
};

const esAdminOAuxiliar = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ ok: false, mensaje: 'No autorizado' });
  }
  const rol = normalizarRol(req.usuarioRol || (req.usuario.Rol && req.usuario.Rol.Nombre_Rol));
  if (!['admin', 'auxiliar'].includes(rol)) {
    return res.status(403).json({ ok: false, mensaje: 'Acceso denegado. Se requiere administrador o auxiliar' });
  }
  next();
};

const tieneRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, mensaje: 'No autorizado' });
    }
    const rol = normalizarRol(req.usuarioRol || (req.usuario.Rol && req.usuario.Rol.Nombre_Rol));
    if (!rolesPermitidos.map(r => normalizarRol(r)).includes(rol)) {
      return res.status(403).json({ ok: false, mensaje: `Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}` });
    }
    next();
  };
};

module.exports = { esAdministrador, esCliente, esAdminOAuxiliar, tieneRol };