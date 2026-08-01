const { Paquete } = require('../models');

// GET /api/paquetes — Listar todos los paquetes (público o admin)
const listarPaquetes = async (req, res) => {
  try {
    const paquetes = await Paquete.findAll();
    res.json(paquetes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener paquetes', error: error.message });
  }
};

// GET /api/paquetes/:id — Obtener un paquete por ID
const obtenerPaquetePorId = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ mensaje: 'Paquete no encontrado' });
    res.json(paquete);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener paquete', error: error.message });
  }
};

// POST /api/paquetes/admin — Crear paquete
const crearPaquete = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen } = req.body;
    const nuevo = await Paquete.create({
      Nombre_Paquete: nombre,
      Descripcion_Paquete: descripcion,
      Precio_Paquete: precio,
      Imagen_Paquete: imagen,
      Activo: true
    });
    res.status(201).json({ ok: true, paquete: nuevo });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear paquete', error: error.message });
  }
};

// PUT /api/paquetes/admin/:id — Editar paquete
const editarPaquete = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ mensaje: 'Paquete no encontrado' });

    const { nombre, descripcion, precio, imagen } = req.body;
    await paquete.update({
      Nombre_Paquete: nombre,
      Descripcion_Paquete: descripcion,
      Precio_Paquete: precio,
      Imagen_Paquete: imagen
    });

    res.json({ ok: true, paquete });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al editar paquete', error: error.message });
  }
};

// PATCH /api/paquetes/admin/:id/toggle — Activar/Desactivar
const togglePaquete = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ mensaje: 'Paquete no encontrado' });

    await paquete.update({ Activo: !paquete.Activo });
    res.json({ ok: true, activo: paquete.Activo });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al cambiar estado', error: error.message });
  }
};

// DELETE /api/paquetes/admin/:id — Eliminar
const eliminarPaquete = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ mensaje: 'Paquete no encontrado' });

    await paquete.destroy();
    res.json({ ok: true, mensaje: 'Paquete eliminado' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar paquete', error: error.message });
  }
};

module.exports = {
  listarPaquetes,
  obtenerPaquetePorId,
  crearPaquete,
  editarPaquete,
  togglePaquete,
  eliminarPaquete
};
