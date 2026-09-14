const { verificarToken } = require('./auth');

const esAdministrador = (req, res, next) => {
  if (req.usuarioRol !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'Permisos insuficientes' });
  }
  next();
};

const esAdminOAuxiliar = (req, res, next) => {
  if (!['admin', 'auxiliar'].includes(req.usuarioRol)) {
    return res.status(403).json({ ok: false, mensaje: 'Permisos insuficientes' });
  }
  next();
};

module.exports = { verificarToken, esAdministrador, esAdminOAuxiliar };
