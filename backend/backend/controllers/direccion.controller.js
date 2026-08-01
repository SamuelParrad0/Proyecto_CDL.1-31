const { Direccion } = require('../models');

// GET /api/direcciones
const obtenerMisDirecciones = async (req, res) => {
  try {
    const direcciones = await Direccion.findAll({ where: { Id_Usuario: req.usuarioId } });
    res.json({ ok: true, direcciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener direcciones' });
  }
};

// GET /api/direcciones/:id
const obtenerDireccionPorId = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';
    const where = esAdmin
      ? { Id_Direccion: req.params.id }
      : { Id_Direccion: req.params.id, Id_Usuario: req.usuarioId };

    const direccion = await Direccion.findOne({ where });
    if (!direccion) return res.status(404).json({ ok: false, mensaje: 'Dirección no encontrada' });

    res.json({ ok: true, direccion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener la dirección' });
  }
};

// POST /api/direcciones
const crearDireccion = async (req, res) => {
  try {
    const { nombreCompleto, direccion, departamento, municipio, barrio, apto, telefono, indicaciones, tipo } = req.body;

    const nuevaDireccion = await Direccion.create({
      Id_Usuario:          req.usuarioId,
      Nombre_Completo:     nombreCompleto,
      Direccion:           direccion,
      Departamento:        departamento,
      Municipio_Localidad: municipio,
      Barrio:              barrio,
      Apart_Casa:          apto,
      Telefono:            telefono,
      Indicaciones:        indicaciones,
      Residencia_Laboral:  tipo || 'residencial'
    });

    res.status(201).json({ ok: true, mensaje: 'Dirección guardada correctamente', direccion: nuevaDireccion });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: 'Error al crear la dirección' });
  }
};

// PUT /api/direcciones/:id
const editarDireccion = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';
    const where = esAdmin
      ? { Id_Direccion: req.params.id }
      : { Id_Direccion: req.params.id, Id_Usuario: req.usuarioId };

    const dir = await Direccion.findOne({ where });
    if (!dir) return res.status(404).json({ ok: false, mensaje: 'Dirección no encontrada' });

    const {
      nombreCompleto,    Nombre_Completo,
      direccion,         Direccion: DireccionBody,
      direccionTexto,
      departamento,      Departamento,
      municipio,         Municipio_Localidad,
      barrio,            Barrio,
      apto,              Apart_Casa,
      telefono,          Telefono,
      indicaciones,      Indicaciones,
      tipo,              Residencia_Laboral
    } = req.body;

    await dir.update({
      Nombre_Completo:     (nombreCompleto || Nombre_Completo)                       ?? dir.Nombre_Completo,
      Direccion:           (direccion || DireccionBody || direccionTexto)             ?? dir.Direccion,
      Departamento:        (departamento || Departamento)                             ?? dir.Departamento,
      Municipio_Localidad: (municipio || Municipio_Localidad)                        ?? dir.Municipio_Localidad,
      Barrio:              (barrio || Barrio)                                         ?? dir.Barrio,
      Apart_Casa:          (apto || Apart_Casa)                                      ?? dir.Apart_Casa,
      Telefono:            (telefono || Telefono)                                     ?? dir.Telefono,
      Indicaciones:        (indicaciones || Indicaciones)                             ?? dir.Indicaciones,
      Residencia_Laboral:  (tipo || Residencia_Laboral)                              ?? dir.Residencia_Laboral
    });

    res.json({ ok: true, mensaje: 'Dirección actualizada', direccion: dir });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

// PATCH /api/direcciones/:id/toggle
const toggleDireccion = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';
    const where = esAdmin
      ? { Id_Direccion: req.params.id }
      : { Id_Direccion: req.params.id, Id_Usuario: req.usuarioId };

    const direccion = await Direccion.findOne({ where });
    if (!direccion) return res.status(404).json({ ok: false, mensaje: 'Dirección no encontrada' });

    res.json({ ok: true, mensaje: 'Estado actualizado', direccion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// DELETE /api/direcciones/:id
const eliminarDireccion = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';
    const where = esAdmin
      ? { Id_Direccion: req.params.id }
      : { Id_Direccion: req.params.id, Id_Usuario: req.usuarioId };

    const direccion = await Direccion.findOne({ where });
    if (!direccion) return res.status(404).json({ ok: false, mensaje: 'Dirección no encontrada' });

    await direccion.destroy();
    res.json({ ok: true, mensaje: 'Dirección eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar la dirección' });
  }
};

module.exports = {
  obtenerMisDirecciones, obtenerDireccionPorId,
  crearDireccion, editarDireccion, toggleDireccion, eliminarDireccion
};