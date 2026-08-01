/**
 * SERVICIO DE AUTENTICACIÓN
 * Gestiona: login, registro, logout, sesión, perfil.
 * Rutas reales del backend CDL:
 *   POST /api/auth/login       → { correo, password }
 *   POST /api/auth/registro    → { nombre, apellidos, correo, contraseña, celular }
 *   GET  /api/auth/perfil      → (auth)
 *   PUT  /api/auth/perfil      → (auth)
 */

import clienteApi from '../api/clienteApi';
import { CLAVES_STORAGE } from '../utilidades/constantes';
import { almacenamientoObtener, almacenamientoGuardar, almacenamientoEliminar } from '../utilidades/almacenamiento';

const servicioAuth = {
  /**
   * Inicia sesión con correo y contraseña.
   * Persiste el token y el usuario en almacenamiento local.
   */
  login: async (correo, password) => {
    const respuesta = await clienteApi.post('/auth/login', { correo, password });
    const datos = respuesta.data;

    if (datos?.token) {
      await almacenamientoGuardar(CLAVES_STORAGE.token, datos.token);
    }
    if (datos?.usuario) {
      await almacenamientoGuardar(CLAVES_STORAGE.usuario, JSON.stringify(datos.usuario));
    }

    return datos;
  },

  /**
   * Registra un nuevo usuario como cliente.
   * Persiste sesión si el backend devuelve token.
   */
  registro: async ({ nombre, apellidos, correo, contraseña, celular }) => {
    const respuesta = await clienteApi.post('/auth/registro', {
      nombre,
      apellidos,
      correo,
      contraseña,
      celular,
    });
    const datos = respuesta.data;

    if (datos?.token) {
      await almacenamientoGuardar(CLAVES_STORAGE.token, datos.token);
    }
    if (datos?.usuario) {
      await almacenamientoGuardar(CLAVES_STORAGE.usuario, JSON.stringify(datos.usuario));
    }

    return datos;
  },

  /**
   * Cierra la sesión limpiando el almacenamiento local.
   */
  cerrarSesion: async () => {
    await almacenamientoEliminar([CLAVES_STORAGE.token, CLAVES_STORAGE.usuario, CLAVES_STORAGE.carritoLocal]);
  },

  /**
   * Lee la sesión guardada en almacenamiento local al abrir la app.
   */
  obtenerSesion: async () => {
    const token = await almacenamientoObtener(CLAVES_STORAGE.token);
    const usuarioRaw = await almacenamientoObtener(CLAVES_STORAGE.usuario);
    let usuario = null;
    if (usuarioRaw) {
      try {
        usuario = JSON.parse(usuarioRaw);
      } catch {
        usuario = null;
      }
    }
    return { token, usuario };
  },

  /**
   * Obtiene el perfil actualizado desde el backend.
   */
  obtenerPerfil: async () => {
    const respuesta = await clienteApi.get('/auth/perfil');
    return respuesta.data?.usuario || respuesta.data;
  },

  /**
   * Actualiza el perfil del usuario autenticado.
   * Soporta cambio de datos personales y contraseña.
   */
  actualizarPerfil: async ({ nombre, apellidos, correo, celular, passwordActual, passwordNuevo }) => {
    const cuerpo = {};
    if (nombre) cuerpo.nombre = nombre;
    if (apellidos !== undefined) cuerpo.apellidos = apellidos;
    if (correo) cuerpo.correo = correo;
    if (celular !== undefined) cuerpo.celular = celular;
    if (passwordActual) cuerpo.passwordActual = passwordActual;
    if (passwordNuevo) cuerpo.passwordNuevo = passwordNuevo;

    const respuesta = await clienteApi.put('/auth/perfil', cuerpo);
    const usuario = respuesta.data?.usuario;

    if (usuario) {
      await almacenamientoGuardar(CLAVES_STORAGE.usuario, JSON.stringify(usuario));
    }
    return usuario || respuesta.data;
  },
};

export default servicioAuth;
