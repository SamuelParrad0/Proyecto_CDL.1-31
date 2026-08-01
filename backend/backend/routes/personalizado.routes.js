const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdminOAuxiliar } = require('../middleware/checkRole');
const {
  crearPersonalizado,
  obtenerMisSolicitudes,
  obtenerSolicitudPorId,
  editarSolicitud,
  eliminarSolicitud,
  verTodasSolicitudes,
  cambiarEstadoSolicitud,
  toggleSolicitud,
  eliminarSolicitudAdmin,
  cancelarSolicitud
} = require('../controllers/personalizado.controller');

// ── ADMIN / AUXILIAR ──────────────────────────────────────────────
router.get('/admin/todas', verificarToken, esAdminOAuxiliar, verTodasSolicitudes);
router.put('/admin/:id/estado', verificarToken, esAdminOAuxiliar, cambiarEstadoSolicitud);
router.delete('/admin/:id', verificarToken, esAdminOAuxiliar, eliminarSolicitudAdmin);

// ── CLIENTE ────────────────────────────────────────────
router.post('/', verificarToken, crearPersonalizado);
router.get('/', verificarToken, obtenerMisSolicitudes);
router.get('/:id', verificarToken, obtenerSolicitudPorId);
router.put('/:id', verificarToken, editarSolicitud);
router.patch('/:id/toggle', verificarToken, toggleSolicitud);
router.delete('/:id', verificarToken, eliminarSolicitud);
router.patch('/:id/cancelar', verificarToken, cancelarSolicitud);
router.put('/:id/cancelar', verificarToken, cancelarSolicitud);

module.exports = router;