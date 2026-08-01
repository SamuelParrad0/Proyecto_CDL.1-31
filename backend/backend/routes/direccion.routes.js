const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const {
  obtenerMisDirecciones,
  obtenerDireccionPorId,
  crearDireccion,
  editarDireccion,
  toggleDireccion,
  eliminarDireccion
} = require('../controllers/direccion.controller');

router.get('/', verificarToken, obtenerMisDirecciones);
router.post('/', verificarToken, crearDireccion);
router.get('/:id', verificarToken, obtenerDireccionPorId);
router.put('/:id', verificarToken, editarDireccion);
router.patch('/:id/toggle', verificarToken, toggleDireccion);
router.delete('/:id', verificarToken, eliminarDireccion);

module.exports = router;