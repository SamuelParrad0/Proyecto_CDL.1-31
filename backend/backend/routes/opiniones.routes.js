const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador, esAdminOAuxiliar } = require('../middleware/checkRole');
const {
  listarOpiniones,
  obtenerOpinionPorId,
  crearOpinion,
  editarOpinion,
  toggleOpinion,
  eliminarOpinion
} = require('../controllers/opiniones.controller');

// ── ADMIN — van ANTES que /:id ─────────────────────────
router.patch('/admin/:id/estado', verificarToken, esAdminOAuxiliar, toggleOpinion);
router.delete('/admin/:id', verificarToken, esAdministrador, eliminarOpinion);

// ── PÚBLICO / CLIENTE ──────────────────────────────────
router.get('/', listarOpiniones);
router.get('/:id', obtenerOpinionPorId);
router.post('/', verificarToken, crearOpinion);
router.put('/:id', verificarToken, editarOpinion);
router.delete('/:id', verificarToken, eliminarOpinion);

module.exports = router;