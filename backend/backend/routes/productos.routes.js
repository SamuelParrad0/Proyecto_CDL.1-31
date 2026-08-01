const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador, esAdminOAuxiliar } = require('../middleware/checkRole');
const {
  listarProductos,
  verProducto,
  listarPorCategoria,
  listarTodos,
  crearProducto,
  editarProducto,
  activarDesactivar,
  eliminarProducto
} = require('../controllers/productos.controller');

// Middleware opcional — intenta verificar token pero no bloquea si no hay
const verificarTokenOpcional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();
  return verificarToken(req, res, next);
};

// ── ADMIN / AUXILIAR ─────────────────────────────────
router.get('/admin/todos', verificarToken, esAdminOAuxiliar, listarTodos);
router.post('/admin', verificarToken, esAdminOAuxiliar, crearProducto);
router.put('/admin/:id', verificarToken, esAdminOAuxiliar, editarProducto);
router.patch('/admin/:id/activar', verificarToken, esAdminOAuxiliar, activarDesactivar);
router.delete('/admin/:id', verificarToken, esAdminOAuxiliar, eliminarProducto);

// ── PÚBLICAS ───────────────────────────────────────────
router.get('/', listarProductos);
router.get('/categoria/:categoriaId', listarPorCategoria);

// Token opcional para que admin pueda ver productos desactivados
router.get('/:id', verificarTokenOpcional, verProducto);

module.exports = router;