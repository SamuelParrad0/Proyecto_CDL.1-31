/**
 * SERVICIO DE PEDIDOS PERSONALIZADOS
 * Rutas reales del backend CDL:
 *   POST   /api/personalizado          → crear solicitud (auth)
 *   GET    /api/personalizado          → mis solicitudes (auth)
 *   GET    /api/personalizado/:id      → detalle (auth)
 *   PUT    /api/personalizado/:id      → editar (auth)
 *   DELETE /api/personalizado/:id      → eliminar (auth)
 *
 * Campos: { nombreCompleto, correo, numeroTelefono, destinatario,
 *   descripcionIdea, elementosEsenciales, prioridadCliente, comentariosAdicionales }
 */

import clienteApi from '../api/clienteApi';

const servicioPersonalizado = {
  crearPersonalizado: async (datos) => {
    const respuesta = await clienteApi.post('/personalizado', datos);
    return respuesta.data;
  },

  obtenerMisSolicitudes: async () => {
    const respuesta = await clienteApi.get('/personalizado');
    const datos = respuesta.data;
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.solicitudes)) return datos.solicitudes;
    return [];
  },

  obtenerSolicitudPorId: async (id) => {
    const respuesta = await clienteApi.get(`/personalizado/${id}`);
    return respuesta.data?.solicitud || respuesta.data;
  },

  editarSolicitud: async (id, datos) => {
    const respuesta = await clienteApi.put(`/personalizado/${id}`, datos);
    return respuesta.data;
  },

  eliminarSolicitud: async (id) => {
    const respuesta = await clienteApi.delete(`/personalizado/${id}`);
    return respuesta.data;
  },

  cancelarSolicitud: async (id) => {
    const respuesta = await clienteApi.patch(`/personalizado/${id}/cancelar`);
    return respuesta.data;
  },
};

export default servicioPersonalizado;
