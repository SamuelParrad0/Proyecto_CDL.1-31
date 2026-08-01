const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador, esAdminOAuxiliar } = require('../middleware/checkRole');
const {
  listarPaquetes,
  obtenerPaquetePorId,
  crearPaquete,
  editarPaquete,
  togglePaquete,
  eliminarPaquete
} = require('../controllers/paquetes.controller');

// Rutas públicas
router.get('/', listarPaquetes);
router.get('/:id', obtenerPaquetePorId);

// Rutas admin / auxiliar
router.post('/admin', verificarToken, esAdminOAuxiliar, crearPaquete);
router.put('/admin/:id', verificarToken, esAdminOAuxiliar, editarPaquete);
router.patch('/admin/:id/toggle', verificarToken, esAdminOAuxiliar, togglePaquete);
router.delete('/admin/:id', verificarToken, esAdminOAuxiliar, eliminarPaquete);

module.exports = router;
