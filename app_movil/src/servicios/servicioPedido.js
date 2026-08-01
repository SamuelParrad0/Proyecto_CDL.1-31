/**
 * SERVICIO DE PEDIDOS
 * Gestiona pedidos del cliente.
 * Rutas reales del backend CDL:
 *   POST  /api/pedidos                → crear pedido (auth) { direccionEnvio, telefono, notas }
 *   GET   /api/pedidos                → mis pedidos (auth)
 *   GET   /api/pedidos/:id            → detalle pedido (auth)
 *   PATCH /api/pedidos/:id/cancelar   → cancelar pedido (auth)
 *
 * Respuesta: { ok, pedidos: [...] } o { ok, pedido: {...} }
 */

import clienteApi from '../api/clienteApi';

const servicioPedido = {
  /**
   * Crea un pedido a partir del carrito del usuario.
   * El backend toma los items del carrito automáticamente.
   */
  crearPedido: async ({ direccionEnvio, telefono, notas = '', metodoPago }) => {
    const respuesta = await clienteApi.post('/pedidos', { direccionEnvio, telefono, notas, metodoPago });
    const datos = respuesta.data;
    return datos?.pedido || datos;
  },

  /**
   * Obtiene el historial de pedidos del usuario autenticado.
   */
  obtenerMisPedidos: async () => {
    const respuesta = await clienteApi.get('/pedidos');
    const datos = respuesta.data;
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.pedidos)) return datos.pedidos;
    return [];
  },

  /**
   * Obtiene el detalle completo de un pedido por ID.
   */
  obtenerPedidoPorId: async (id) => {
    const respuesta = await clienteApi.get(`/pedidos/${id}`);
    const datos = respuesta.data;
    return datos?.pedido || datos;
  },

  /**
   * Cancela un pedido (solo si está en estado pendiente o pagado).
   */
  cancelarPedido: async (id) => {
    const respuesta = await clienteApi.patch(`/pedidos/${id}/cancelar`);
    return respuesta.data;
  },
};

export default servicioPedido;
