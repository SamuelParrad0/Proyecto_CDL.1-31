const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const {
  agregarProducto,
  verCarrito,
  verItemPorId,
  actualizarCantidad,
  toggleItem,
  eliminarItem,
  vaciarCarrito
} = require('../controllers/carrito.controller');

router.get('/', verificarToken, verCarrito);
router.post('/', verificarToken, agregarProducto);
router.get('/:id', verificarToken, verItemPorId);
router.put('/:id', verificarToken, actualizarCantidad);
router.patch('/:id/toggle', verificarToken, toggleItem);
router.delete('/', verificarToken, vaciarCarrito);
router.delete('/:id', verificarToken, eliminarItem);

module.exports = router;