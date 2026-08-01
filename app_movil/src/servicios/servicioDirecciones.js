/**
 * SERVICIO DE DIRECCIONES
 * Rutas reales del backend CDL:
 *   GET    /api/direcciones       → mis direcciones (auth)
 *   POST   /api/direcciones       → crear (auth)
 *   PUT    /api/direcciones/:id   → editar (auth)
 *   DELETE /api/direcciones/:id   → eliminar (auth)
 *
 * Campos: { nombreCompleto, direccion, departamento, municipioLocalidad,
 *   barrio, apartCasa, telefono, indicaciones, residenciaLaboral }
 */

import clienteApi from '../api/clienteApi';

const servicioDirecciones = {
  obtenerMisDirecciones: async () => {
    const respuesta = await clienteApi.get('/direcciones');
    const datos = respuesta.data;
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.direcciones)) return datos.direcciones;
    return [];
  },

  crearDireccion: async (datos) => {
    const respuesta = await clienteApi.post('/direcciones', datos);
    return respuesta.data;
  },

  editarDireccion: async (id, datos) => {
    const respuesta = await clienteApi.put(`/direcciones/${id}`, datos);
    return respuesta.data;
  },

  eliminarDireccion: async (id) => {
    const respuesta = await clienteApi.delete(`/direcciones/${id}`);
    return respuesta.data;
  },
};

export default servicioDirecciones;
