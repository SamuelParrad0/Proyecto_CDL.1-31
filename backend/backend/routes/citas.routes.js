const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdminOAuxiliar } = require('../middleware/checkRole');
const {
  crearCita,
  obtenerMisCitas,
  obtenerCitaPorId,
  editarCita,
  cancelarCita,
  toggleCita,
  eliminarCita,
  verTodasCitas,
  cambiarEstadoCita
} = require('../controllers/citas.controller');

// ── ADMIN / AUXILIAR — van ANTES que /:id ─────────────────────────
router.get('/admin/todas', verificarToken, esAdminOAuxiliar, verTodasCitas);
router.put('/admin/:id/estado', verificarToken, esAdminOAuxiliar, cambiarEstadoCita);
router.delete('/admin/:id', verificarToken, esAdminOAuxiliar, eliminarCita);

// ── CLIENTE ────────────────────────────────────────────
router.post('/', verificarToken, crearCita);
router.get('/', verificarToken, obtenerMisCitas);
router.get('/:id', verificarToken, obtenerCitaPorId);
router.put('/:id', verificarToken, editarCita);
router.patch('/:id/cancelar', verificarToken, cancelarCita);
router.put('/:id/cancelar', verificarToken, cancelarCita);
router.patch('/:id/toggle', verificarToken, toggleCita);

module.exports = router;