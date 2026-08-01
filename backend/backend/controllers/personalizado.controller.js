const { Personalizado, Usuario } = require('../models');

// POST /api/personalizado
const crearPersonalizado = async (req, res) => {
  try {
    const { nombreCompleto, correo, telefono, destinatario,
      descripcionIdea, elementosEsenciales, prioridadCliente, comentariosAdicionales } = req.body;

    const solicitud = await Personalizado.create({
      Id_Usuario: req.usuarioId,
      Nombre_Completo: nombreCompleto,
      Correo: correo,
      Numero_Telefono: telefono,
      Destinatario: destinatario || 'para_mi',
      Descripcion_Idea: descripcionIdea,
      Elementos_Esenciales: elementosEsenciales,
      Prioridad_Cliente: prioridadCliente,
      Comentarios_Adicionales: comentariosAdicionales,
      Estado_Personalizado: 'pendiente',
      Fecha_Solicitud: new Date()
    });

    res.status(201).json({ ok: true, mensaje: 'Solicitud creada correctamente', solicitud });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

// GET /api/personalizado
const obtenerMisSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Personalizado.findAll({
      where: { Id_Usuario: req.usuarioId },
      order: [['Fecha_Solicitud', 'DESC']]
    });
    res.json({ ok: true, solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener solicitudes' });
  }
};

// GET /api/personalizado/:id
const obtenerSolicitudPorId = async (req, res) => {
  try {
    const esGestion = ['admin', 'administrador', 'auxiliar'].includes(req.usuarioRol);

    const where = esGestion
      ? { Id_Personalizado: req.params.id }
      : { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId };

    const solicitud = await Personalizado.findOne({ where });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    res.json({ ok: true, solicitud });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener la solicitud' });
  }
};

// PUT /api/personalizado/:id
const editarSolicitud = async (req, res) => {
  try {
    const esGestion = ['admin', 'administrador', 'auxiliar'].includes(req.usuarioRol);

    const where = esGestion
      ? { Id_Personalizado: req.params.id }
      : { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId };

    const solicitud = await Personalizado.findOne({ where });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    // Cliente solo puede editar si está pendiente
    if (!esGestion && solicitud.Estado_Personalizado !== 'pendiente') {
      return res.status(400).json({ ok: false, mensaje: 'Solo puedes editar solicitudes en estado pendiente' });
    }

    const { nombreCompleto, correo, telefono, destinatario,
      descripcionIdea, elementosEsenciales, prioridadCliente, comentariosAdicionales,
      Nombre_Completo, Correo: CorreoBody, Numero_Telefono, Destinatario,
      Descripcion_Idea, Elementos_Esenciales, Prioridad_Cliente, Comentarios_Adicionales
    } = req.body;

    await solicitud.update({
      Nombre_Completo:         (nombreCompleto || Nombre_Completo)                   ?? solicitud.Nombre_Completo,
      Correo:                  (correo || CorreoBody)                                ?? solicitud.Correo,
      Numero_Telefono:         (telefono || Numero_Telefono)                         ?? solicitud.Numero_Telefono,
      Destinatario:            (destinatario || Destinatario)                        ?? solicitud.Destinatario,
      Descripcion_Idea:        (descripcionIdea || Descripcion_Idea)                 ?? solicitud.Descripcion_Idea,
      Elementos_Esenciales:    (elementosEsenciales || Elementos_Esenciales)         ?? solicitud.Elementos_Esenciales,
      Prioridad_Cliente:       (prioridadCliente || Prioridad_Cliente)               ?? solicitud.Prioridad_Cliente,
      Comentarios_Adicionales: (comentariosAdicionales || Comentarios_Adicionales)   ?? solicitud.Comentarios_Adicionales
    });

    res.json({ ok: true, mensaje: 'Solicitud actualizada', solicitud });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

// PATCH /api/personalizado/:id/toggle
const toggleSolicitud = async (req, res) => {
  try {
    const esGestion = ['admin', 'administrador', 'auxiliar'].includes(req.usuarioRol);

    const where = esGestion
      ? { Id_Personalizado: req.params.id }
      : { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId };

    const solicitud = await Personalizado.findOne({ where });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    const nuevoEstado = solicitud.Estado_Personalizado === 'pendiente' ? 'cancelado' : 'pendiente';
    await solicitud.update({ Estado_Personalizado: nuevoEstado });

    res.json({ ok: true, mensaje: `Solicitud ${nuevoEstado}`, solicitud });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al cambiar estado' });
  }
};

// DELETE /api/personalizado/:id
const eliminarSolicitud = async (req, res) => {
  try {
    const solicitud = await Personalizado.findOne({
      where: { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId }
    });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    await solicitud.destroy();
    res.json({ ok: true, mensaje: 'Solicitud eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar la solicitud' });
  }
};

// GET /api/personalizado/admin/todas
const verTodasSolicitudes = async (req, res) => {
  try {
    const { estado } = req.query;
    const where = estado ? { Estado_Personalizado: estado } : {};

    const solicitudes = await Personalizado.findAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['Id_Usuario', 'Nombre', 'Correo'] }],
      order: [['Fecha_Solicitud', 'DESC']]
    });

    res.json({ ok: true, solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener solicitudes' });
  }
};

// PUT /api/personalizado/admin/:id/estado
const cambiarEstadoSolicitud = async (req, res) => {
  try {
    const { estado } = req.body;

    // Mapeo de nombres visibles del frontend a valores internos de la BD
    const mapeoEstados = {
      'pendiente': 'pendiente',
      'Pendiente': 'pendiente',
      'Analizando tu idea': 'en-revision',
      'en-revision': 'en-revision',
      'Creando tu idea junto a ti': 'aprobado',
      'aprobado': 'aprobado',
      'Dando vida a tu idea': 'rechazado',
      'rechazado': 'rechazado',
      '¡Tu creación ya está contigo!': 'completado',
      'completado': 'completado',
      'cancelado': 'cancelado',
      'cancelada': 'cancelado'
    };

    const estadoMapeado = mapeoEstados[estado];
    if (!estadoMapeado) {
      return res.status(400).json({ ok: false, mensaje: 'Estado inválido' });
    }

    const solicitud = await Personalizado.findByPk(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    await solicitud.update({ Estado_Personalizado: estadoMapeado });
    res.json({ ok: true, mensaje: 'Estado actualizado correctamente', solicitud });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

// DELETE /api/personalizado/admin/:id
const eliminarSolicitudAdmin = async (req, res) => {
  try {
    const solicitud = await Personalizado.findByPk(req.params.id);

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    await solicitud.destroy();
    res.json({ ok: true, mensaje: 'Solicitud eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar la solicitud' });
  }
};

// PATCH /api/personalizado/:id/cancelar
const cancelarSolicitud = async (req, res) => {
  try {
    const solicitud = await Personalizado.findOne({
      where: { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId }
    });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    if (solicitud.Estado_Personalizado !== 'pendiente') {
      return res.status(400).json({ ok: false, mensaje: 'Solo se pueden cancelar solicitudes en estado pendiente' });
    }

    await solicitud.update({ Estado_Personalizado: 'cancelado' });
    res.json({ ok: true, mensaje: 'Solicitud cancelada correctamente', solicitud });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al cancelar la solicitud' });
  }
};

module.exports = {
  crearPersonalizado, obtenerMisSolicitudes, obtenerSolicitudPorId,
  editarSolicitud, toggleSolicitud, eliminarSolicitud,
  verTodasSolicitudes, cambiarEstadoSolicitud, eliminarSolicitudAdmin,
  cancelarSolicitud
};