const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador, esAdminOAuxiliar } = require('../middleware/checkRole');
const {
  listarCategorias,
  listarTodasAdmin,
  verCategoria,
  crearCategoria,
  editarCategoria,
  activarDesactivar,
  eliminarCategoria
} = require('../controllers/categoria.controller');

// Rutas de admin / auxiliar
router.get('/admin/todas', verificarToken, esAdminOAuxiliar, listarTodasAdmin);
router.post('/', verificarToken, esAdminOAuxiliar, crearCategoria);
router.put('/:id', verificarToken, esAdminOAuxiliar, editarCategoria);
router.patch('/:id/activar', verificarToken, esAdminOAuxiliar, activarDesactivar);
router.delete('/:id', verificarToken, esAdminOAuxiliar, eliminarCategoria);

// Rutas públicas
router.get('/', listarCategorias);
router.get('/:id', verCategoria);

module.exports = router;