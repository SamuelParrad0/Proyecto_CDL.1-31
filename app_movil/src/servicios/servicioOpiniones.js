/**
 * SERVICIO DE OPINIONES / RESEÑAS
 * Rutas reales del backend CDL:
 *   GET    /api/opiniones       → listado público
 *   GET    /api/opiniones/:id   → detalle
 *   POST   /api/opiniones       → crear (auth)
 *   PUT    /api/opiniones/:id   → editar (auth, dueño)
 *   DELETE /api/opiniones/:id   → eliminar (auth, dueño)
 */

import clienteApi from '../api/clienteApi';

const servicioOpiniones = {
  listarOpiniones: async () => {
    const respuesta = await clienteApi.get('/opiniones');
    const datos = respuesta.data;
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.opiniones)) return datos.opiniones;
    return [];
  },

  obtenerOpinionPorId: async (id) => {
    const respuesta = await clienteApi.get(`/opiniones/${id}`);
    return respuesta.data?.opinion || respuesta.data;
  },

  crearOpinion: async ({ comentario, calificacion }) => {
    const respuesta = await clienteApi.post('/opiniones', { comentario, calificacion });
    return respuesta.data;
  },

  editarOpinion: async (id, { comentario, calificacion }) => {
    const respuesta = await clienteApi.put(`/opiniones/${id}`, { comentario, calificacion });
    return respuesta.data;
  },

  eliminarOpinion: async (id) => {
    const respuesta = await clienteApi.delete(`/opiniones/${id}`);
    return respuesta.data;
  },
};

export default servicioOpiniones;
