const { Opinion } = require('../models');

// GET /api/opiniones
const listarOpiniones = async (req, res) => {
  try {
    const opiniones = await Opinion.findAll({
      order: [['Id_Reseña', 'DESC']]
    });
    res.json({ ok: true, opiniones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener opiniones' });
  }
};

// GET /api/opiniones/:id
const obtenerOpinionPorId = async (req, res) => {
  try {
    const opinion = await Opinion.findByPk(req.params.id);
    if (!opinion) {
      return res.status(404).json({ ok: false, mensaje: 'Opinión no encontrada' });
    }
    res.json({ ok: true, opinion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener opinión' });
  }
};

// POST /api/opiniones
const crearOpinion = async (req, res) => {
  try {
    const { nombre, calificacion, comentario } = req.body;

    const nueva = await Opinion.create({
      Nombre_Usuario: nombre,
      Calificacion:   calificacion,
      Comentario:     comentario,
      Id_Usuario:     req.usuarioId || null
    });

    res.status(201).json({ ok: true, opinion: nueva });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: 'Error al crear opinión: ' + error.message });
  }
};

// PUT /api/opiniones/:id
const editarOpinion = async (req, res) => {
  try {
    const opinion = await Opinion.findByPk(req.params.id);
    if (!opinion) {
      return res.status(404).json({ ok: false, mensaje: 'Opinión no encontrada' });
    }

    const { nombre, calificacion, comentario } = req.body;

    await opinion.update({
      Nombre_Usuario: nombre      ?? opinion.Nombre_Usuario,
      Calificacion:   calificacion ?? opinion.Calificacion,
      Comentario:     comentario  ?? opinion.Comentario
    });

    res.json({ ok: true, mensaje: 'Opinión actualizada', opinion });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

// PATCH /api/opiniones/admin/:id/estado
const toggleOpinion = async (req, res) => {
  try {
    const opinion = await Opinion.findByPk(req.params.id);
    if (!opinion) {
      return res.status(404).json({ ok: false, mensaje: 'Opinión no encontrada' });
    }
    await opinion.update({ Activo: !opinion.Activo });
    res.json({ ok: true, mensaje: 'Estado actualizado', opinion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// DELETE /api/opiniones/admin/:id  y  DELETE /api/opiniones/:id
const eliminarOpinion = async (req, res) => {
  try {
    const opinion = await Opinion.findByPk(req.params.id);
    if (!opinion) {
      return res.status(404).json({ ok: false, mensaje: 'Opinión no encontrada' });
    }
    await opinion.destroy();
    res.json({ ok: true, mensaje: 'Opinión eliminada' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: 'Error al eliminar' });
  }
};

module.exports = {
  listarOpiniones,
  obtenerOpinionPorId,
  crearOpinion,
  editarOpinion,
  toggleOpinion,
  eliminarOpinion
};