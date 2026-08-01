/**
 * SERVICIO DE CITAS / RESERVAS DE PAQUETES
 * Rutas reales del backend CDL:
 *   POST   /api/citas                → crear cita (auth)
 *   GET    /api/citas                → mis citas (auth)
 *   GET    /api/citas/:id            → detalle (auth)
 *   PUT    /api/citas/:id            → editar (auth)
 *   PATCH  /api/citas/:id/cancelar   → cancelar (auth)
 *
 * Campos para crear/editar:
 *   { idPaquete, nombreCompleto, correo, numeroTelefono, tipoEvento,
 *     fechaEvento, numeroInvitados, informacionAdicional }
 */

import clienteApi from '../api/clienteApi';

const servicioCitas = {
  crearCita: async (datos) => {
    const respuesta = await clienteApi.post('/citas', datos);
    return respuesta.data;
  },

  obtenerMisCitas: async () => {
    const respuesta = await clienteApi.get('/citas');
    const datos = respuesta.data;
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.citas)) return datos.citas;
    return [];
  },

  obtenerCitaPorId: async (id) => {
    const respuesta = await clienteApi.get(`/citas/${id}`);
    return respuesta.data?.cita || respuesta.data;
  },

  editarCita: async (id, datos) => {
    const respuesta = await clienteApi.put(`/citas/${id}`, datos);
    return respuesta.data;
  },

  cancelarCita: async (id) => {
    const respuesta = await clienteApi.patch(`/citas/${id}/cancelar`);
    return respuesta.data;
  },
};

export default servicioCitas;
