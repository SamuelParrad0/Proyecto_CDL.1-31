const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');
const {
  listarSubcategorias,
  verSubcategoria,
  listarPorCategoria,
  crearSubcategoria,
  editarSubcategoria,
  activarDesactivar,
  eliminarSubcategoria
} = require('../controllers/subcategoria.controller');

// Rutas públicas
router.get('/', listarSubcategorias);
router.get('/categoria/:categoriaId', listarPorCategoria);
router.get('/:id', verSubcategoria);

// Rutas de admin
router.post('/', verificarToken, esAdministrador, crearSubcategoria);
router.put('/:id', verificarToken, esAdministrador, editarSubcategoria);
router.patch('/:id/activar', verificarToken, esAdministrador, activarDesactivar);
router.delete('/:id', verificarToken, esAdministrador, eliminarSubcategoria);

module.exports = router;