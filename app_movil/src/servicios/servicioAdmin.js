/**
 * SERVICIO DE ADMINISTRACIÓN
 * Gestiona operaciones admin: productos, categorías, paquetes, opiniones, citas, personalizado, pedidos.
 * Rutas reales del backend CDL (todas requieren token + rol admin):
 *
 * PRODUCTOS:
 *   GET    /api/productos/admin/todos          → listar todos
 *   POST   /api/productos/admin                → crear
 *   PUT    /api/productos/admin/:id            → editar
 *   PATCH  /api/productos/admin/:id/activar    → toggle activo
 *   DELETE /api/productos/admin/:id            → eliminar
 *
 * CATEGORÍAS:
 *   GET    /api/categorias/admin/todas         → listar todas
 *   POST   /api/categorias                     → crear
 *   PUT    /api/categorias/:id                 → editar
 *   PATCH  /api/categorias/:id/activar         → toggle activo
 *   DELETE /api/categorias/:id                 → eliminar
 *
 * PAQUETES:
 *   POST   /api/paquetes/admin                 → crear
 *   PUT    /api/paquetes/admin/:id             → editar
 *   PATCH  /api/paquetes/admin/:id/toggle      → toggle activo
 *   DELETE /api/paquetes/admin/:id             → eliminar
 *
 * OPINIONES:
 *   PATCH  /api/opiniones/admin/:id/estado     → cambiar estado
 *   DELETE /api/opiniones/admin/:id            → eliminar
 *
 * CITAS:
 *   GET    /api/citas/admin/todas              → ver todas
 *   PUT    /api/citas/admin/:id/estado         → cambiar estado
 *   DELETE /api/citas/admin/:id                → eliminar
 *
 * PERSONALIZADO:
 *   GET    /api/personalizado/admin/todas      → ver todas
 *   PUT    /api/personalizado/admin/:id/estado → cambiar estado
 *
 * PEDIDOS:
 *   GET    /api/pedidos/admin/todos            → ver todos
 *   PUT    /api/pedidos/admin/:id/estado       → cambiar estado
 *   DELETE /api/pedidos/admin/:id              → eliminar
 */

import clienteApi from '../api/clienteApi';

// ════════════════════════════════════════════════════════════════════════════════
// PRODUCTOS ADMIN
// ════════════════════════════════════════════════════════════════════════════════

export async function listarProductosAdmin() {
  const res = await clienteApi.get('/productos/admin/todos');
  const datos = res.data;
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.productos)) return datos.productos;
  return [];
}

export async function crearProducto(data) {
  const res = await clienteApi.post('/productos/admin', data);
  return res.data;
}

export async function editarProducto(id, data) {
  const res = await clienteApi.put(`/productos/admin/${id}`, data);
  return res.data;
}

export async function toggleProducto(id) {
  const res = await clienteApi.patch(`/productos/admin/${id}/activar`);
  return res.data;
}

export async function eliminarProducto(id) {
  const res = await clienteApi.delete(`/productos/admin/${id}`);
  return res.data;
}

// ════════════════════════════════════════════════════════════════════════════════
// CATEGORÍAS ADMIN
// ════════════════════════════════════════════════════════════════════════════════

export async function listarCategoriasAdmin() {
  const res = await clienteApi.get('/categorias/admin/todas');
  const datos = res.data;
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.categorias)) return datos.categorias;
  return [];
}

export async function crearCategoria(data) {
  const res = await clienteApi.post('/categorias', data);
  return res.data;
}

export async function editarCategoria(id, data) {
  const res = await clienteApi.put(`/categorias/${id}`, data);
  return res.data;
}

export async function toggleCategoria(id) {
  const res = await clienteApi.patch(`/categorias/${id}/activar`);
  return res.data;
}

export async function eliminarCategoria(id) {
  const res = await clienteApi.delete(`/categorias/${id}`);
  return res.data;
}

// ════════════════════════════════════════════════════════════════════════════════
// PAQUETES ADMIN
// ════════════════════════════════════════════════════════════════════════════════

export async function crearPaquete(data) {
  const res = await clienteApi.post('/paquetes/admin', data);
  return res.data;
}

export async function editarPaquete(id, data) {
  const res = await clienteApi.put(`/paquetes/admin/${id}`, data);
  return res.data;
}

export async function togglePaquete(id) {
  const res = await clienteApi.patch(`/paquetes/admin/${id}/toggle`);
  return res.data;
}

export async function eliminarPaquete(id) {
  const res = await clienteApi.delete(`/paquetes/admin/${id}`);
  return res.data;
}

// ════════════════════════════════════════════════════════════════════════════════
// OPINIONES ADMIN
// ════════════════════════════════════════════════════════════════════════════════

export async function toggleOpinionAdmin(id) {
  const res = await clienteApi.patch(`/opiniones/admin/${id}/estado`);
  return res.data;
}

export async function eliminarOpinionAdmin(id) {
  const res = await clienteApi.delete(`/opiniones/admin/${id}`);
  return res.data;
}

// ════════════════════════════════════════════════════════════════════════════════
// CITAS ADMIN
// ════════════════════════════════════════════════════════════════════════════════

export async function listarTodasCitas() {
  const res = await clienteApi.get('/citas/admin/todas');
  const datos = res.data;
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.citas)) return datos.citas;
  return [];
}

export async function cambiarEstadoCita(id, estado) {
  const res = await clienteApi.put(`/citas/admin/${id}/estado`, { estado });
  return res.data;
}

export async function eliminarCitaAdmin(id) {
  const res = await clienteApi.delete(`/citas/admin/${id}`);
  return res.data;
}

export async function editarCitaAdmin(id, data) {
  const res = await clienteApi.put(`/citas/${id}`, data);
  return res.data;
}

// ════════════════════════════════════════════════════════════════════════════════
// PERSONALIZADO ADMIN
// ════════════════════════════════════════════════════════════════════════════════

export async function listarTodasSolicitudes() {
  const res = await clienteApi.get('/personalizado/admin/todas');
  const datos = res.data;
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.solicitudes)) return datos.solicitudes;
  return [];
}

export async function cambiarEstadoSolicitud(id, estado) {
  const res = await clienteApi.put(`/personalizado/admin/${id}/estado`, { estado });
  return res.data;
}

export async function eliminarSolicitudAdmin(id) {
  const res = await clienteApi.delete(`/personalizado/admin/${id}`);
  return res.data;
}

export async function editarSolicitudAdmin(id, data) {
  const res = await clienteApi.put(`/personalizado/${id}`, data);
  return res.data;
}

// ════════════════════════════════════════════════════════════════════════════════
// PEDIDOS ADMIN
// ════════════════════════════════════════════════════════════════════════════════

export async function listarTodosPedidos() {
  const res = await clienteApi.get('/pedidos/admin/todos');
  const datos = res.data;
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.pedidos)) return datos.pedidos;
  return [];
}

export async function cambiarEstadoPedido(id, estado) {
  const res = await clienteApi.put(`/pedidos/admin/${id}/estado`, { estado });
  return res.data;
}

export async function editarPedidoAdmin(id, data) {
  const res = await clienteApi.put(`/pedidos/${id}`, data);
  return res.data;
}

export async function eliminarPedidoAdmin(id) {
  const res = await clienteApi.delete(`/pedidos/admin/${id}`);
  return res.data;
}
