/**
 * SERVICIO DE PAQUETES
 * Gestiona consultas públicas de paquetes de servicios.
 * Rutas reales del backend CDL:
 *   GET /api/paquetes       → listar paquetes activos
 *   GET /api/paquetes/:id   → obtener paquete por ID
 */

import clienteApi from '../api/clienteApi';

const servicioPaquetes = {
  /**
   * Obtiene la lista de paquetes activos.
   */
  listarPaquetes: async () => {
    const respuesta = await clienteApi.get('/paquetes');
    const datos = respuesta.data;
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.paquetes)) return datos.paquetes;
    return [];
  },

  /**
   * Obtiene un paquete por ID con toda su información.
   */
  obtenerPaquetePorId: async (id) => {
    const respuesta = await clienteApi.get(`/paquetes/${id}`);
    const datos = respuesta.data;
    return datos?.paquete || datos;
  },
};

export default servicioPaquetes;
