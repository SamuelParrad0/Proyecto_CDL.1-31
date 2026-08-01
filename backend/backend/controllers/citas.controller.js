const { ReservaPaquete, Usuario, Paquete } = require('../models');

// POST /api/citas
const crearCita = async (req, res) => {
  try {
    const {
      paqueteId, nombreCompleto, correo,
      telefono, numeroTelefono,          // acepta ambos nombres
      tipoEvento, fechaEvento, numeroInvitados, informacionAdicional
    } = req.body;

    const reserva = await ReservaPaquete.create({
      Id_Paquete: paqueteId,
      Id_Usuario: req.usuarioId,
      Nombre_Completo: nombreCompleto,
      Correo: correo,
      Numero_Telefono: numeroTelefono || telefono,   // prioriza numeroTelefono
      Tipo_Evento: tipoEvento,
      Fecha_Evento: fechaEvento,
      Numero_Invitados: numeroInvitados,
      Informacion_Adicional: informacionAdicional,
      Estado_Reserva_Paquete: 'pendiente',
      Fecha_Reserva: new Date()
    });

    res.status(201).json({ ok: true, mensaje: 'Reserva creada correctamente', reserva });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


// GET /api/citas
const obtenerMisCitas = async (req, res) => {
  try {
    const reservas = await ReservaPaquete.findAll({
      where: { Id_Usuario: req.usuarioId },
      include: [{ model: Paquete, as: 'paquete' }],
      order: [['Fecha_Reserva', 'DESC']]
    });

    res.json({ ok: true, citas: reservas });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener reservas' });
  }
};


// GET /api/citas/:id
const obtenerCitaPorId = async (req, res) => {
  try {
    const esGestion = ['admin', 'administrador', 'auxiliar'].includes(req.usuarioRol);

    const where = esGestion
      ? { Id_Reserva_Paquete: req.params.id }
      : { Id_Reserva_Paquete: req.params.id, Id_Usuario: req.usuarioId };

    const reserva = await ReservaPaquete.findOne({
      where,
      include: [
        { model: Paquete, as: 'paquete' },
        { model: Usuario, as: 'usuario', attributes: ['Id_Usuario', 'Nombre', 'Correo'] }
      ]
    });

    if (!reserva) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }

    res.json({ ok: true, cita: reserva });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener la cita' });
  }
};


// PUT /api/citas/:id
const editarCita = async (req, res) => {
  try {
    const esGestion = ['admin', 'administrador', 'auxiliar'].includes(req.usuarioRol);

    const where = esGestion
      ? { Id_Reserva_Paquete: req.params.id }
      : { Id_Reserva_Paquete: req.params.id, Id_Usuario: req.usuarioId };

    const reserva = await ReservaPaquete.findOne({ where });

    if (!reserva) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }

    const {
      nombreCompleto, correo,
      telefono, numeroTelefono,          // acepta ambos nombres
      tipoEvento, fechaEvento, numeroInvitados, informacionAdicional
    } = req.body;

    await reserva.update({
      Nombre_Completo: nombreCompleto ?? reserva.Nombre_Completo,
      Correo: correo ?? reserva.Correo,
      Numero_Telefono: (numeroTelefono ?? telefono) ?? reserva.Numero_Telefono,
      Tipo_Evento: tipoEvento ?? reserva.Tipo_Evento,
      Fecha_Evento: fechaEvento ?? reserva.Fecha_Evento,
      Numero_Invitados: numeroInvitados ?? reserva.Numero_Invitados,
      Informacion_Adicional: informacionAdicional ?? reserva.Informacion_Adicional
    });

    res.json({ ok: true, mensaje: 'Cita actualizada', reserva });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


// PATCH /api/citas/:id/cancelar
const cancelarCita = async (req, res) => {
  try {
    const esGestion = ['admin', 'administrador', 'auxiliar'].includes(req.usuarioRol);

    const where = esGestion
      ? { Id_Reserva_Paquete: req.params.id }
      : { Id_Reserva_Paquete: req.params.id, Id_Usuario: req.usuarioId };

    const reserva = await ReservaPaquete.findOne({ where });

    if (!reserva) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }

    if (reserva.Estado_Reserva_Paquete === 'cancelada' || reserva.Estado_Reserva_Paquete === 'cancelado') {
      return res.status(400).json({ ok: false, mensaje: 'Ya está cancelada' });
    }

    await reserva.update({ Estado_Reserva_Paquete: 'cancelada' });

    res.json({ ok: true, mensaje: 'Reserva cancelada', reserva });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


// PATCH /api/citas/:id/toggle
const toggleCita = async (req, res) => {
  try {
    const esGestion = ['admin', 'administrador', 'auxiliar'].includes(req.usuarioRol);

    const where = esGestion
      ? { Id_Reserva_Paquete: req.params.id }
      : { Id_Reserva_Paquete: req.params.id, Id_Usuario: req.usuarioId };

    const reserva = await ReservaPaquete.findOne({ where });

    if (!reserva) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }

    const nuevoEstado = reserva.Estado_Reserva_Paquete === 'cancelada'
      ? 'pendiente'
      : 'cancelada';

    await reserva.update({ Estado_Reserva_Paquete: nuevoEstado });

    res.json({ ok: true, mensaje: `Cita ${nuevoEstado}`, reserva });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};


// DELETE /api/citas/admin/:id
const eliminarCita = async (req, res) => {
  try {
    const reserva = await ReservaPaquete.findByPk(req.params.id);

    if (!reserva) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }

    await reserva.destroy();

    res.json({ ok: true, mensaje: 'Cita eliminada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};


// GET /api/citas/admin/todas
const verTodasCitas = async (req, res) => {
  try {
    const reservas = await ReservaPaquete.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['Id_Usuario', 'Nombre', 'Apellidos', 'Correo', 'Celular'] },
        { model: Paquete, as: 'paquete' }
      ],
      order: [['Fecha_Reserva', 'DESC']]
    });

    res.json({ ok: true, citas: reservas });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener reservas' });
  }
};


// PUT /api/citas/admin/:id/estado
const cambiarEstadoCita = async (req, res) => {
  try {
    let { estado } = req.body;

    // Mapeo de nombres visibles del frontend a valores internos de la BD
    const mapeoEstados = {
      'pendiente': 'pendiente',
      'Pendiente': 'pendiente',
      'En contacto contigo': 'en_contacto',
      'en_contacto': 'en_contacto',
      'Agendada': 'agendada',
      'agendada': 'agendada',
      '¡Misión cumplida!': 'mision_cumplida',
      'mision_cumplida': 'mision_cumplida',
      'cancelada': 'cancelada',
      'cancelado': 'cancelada'
    };

    const estadoMapeado = mapeoEstados[estado];
    if (!estadoMapeado) {
      return res.status(400).json({ ok: false, mensaje: 'Estado inválido' });
    }

    const reserva = await ReservaPaquete.findByPk(req.params.id);

    if (!reserva) {
      return res.status(404).json({ ok: false, mensaje: 'Reserva no encontrada' });
    }

    await reserva.update({ Estado_Reserva_Paquete: estadoMapeado });

    res.json({ ok: true, mensaje: 'Estado actualizado', reserva });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


module.exports = {
  crearCita,
  obtenerMisCitas,
  obtenerCitaPorId,
  editarCita,
  cancelarCita,
  toggleCita,
  eliminarCita,
  verTodasCitas,
  cambiarEstadoCita
};