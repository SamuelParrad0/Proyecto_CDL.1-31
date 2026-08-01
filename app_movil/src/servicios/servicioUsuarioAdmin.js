/**
 * SERVICIO DE USUARIOS ADMIN
 * Gestiona usuarios desde el panel de administración.
 * Rutas reales del backend CDL:
 *   GET    /api/auth/usuarios            → listar todos (admin)
 *   GET    /api/auth/usuarios/:id        → obtener por ID (admin)
 *   PUT    /api/auth/usuarios/:id        → editar usuario (admin)
 *   PATCH  /api/auth/usuarios/:id/toggle → activar/desactivar (admin)
 *   DELETE /api/auth/usuarios/:id        → eliminar (admin)
 *   PUT    /api/auth/admin/:id/rol       → cambiar rol (admin) { nuevoRol }
 */

import clienteApi from '../api/clienteApi';

export async function listarUsuarios() {
  const res = await clienteApi.get('/auth/usuarios');
  const datos = res.data;
  if (Array.isArray(datos)) return datos;
  return [];
}

export async function obtenerUsuarioPorId(id) {
  const res = await clienteApi.get(`/auth/usuarios/${id}`);
  return res.data;
}

export async function editarUsuario(id, data) {
  const res = await clienteApi.put(`/auth/usuarios/${id}`, data);
  return res.data;
}

export async function toggleUsuario(id) {
  const res = await clienteApi.patch(`/auth/usuarios/${id}/toggle`);
  return res.data;
}

export async function eliminarUsuario(id) {
  const res = await clienteApi.delete(`/auth/usuarios/${id}`);
  return res.data;
}

export async function cambiarRolUsuario(id, nuevoRol) {
  const res = await clienteApi.put(`/auth/admin/${id}/rol`, { nuevoRol });
  return res.data;
}
