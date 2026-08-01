/**
 * CLIENTE API — Instancia centralizada de Axios para todas las peticiones HTTP
 *
 * - Configura la URL base del backend y el timeout desde las constantes.
 * - Interceptor de petición: adjunta el JWT automáticamente si existe.
 * - Interceptor de respuesta: normaliza errores del backend para que siempre
 *   se reciba un objeto Error con mensaje legible en español.
 * - Maneja token expirado (401): limpia el almacenamiento automáticamente.
 */

import axios from 'axios';
import { URL_BASE_API, TIEMPO_ESPERA_MS, CLAVES_STORAGE } from '../utilidades/constantes';
import { almacenamientoObtener, almacenamientoEliminar } from '../utilidades/almacenamiento';

// ─── Instancia de Axios ───────────────────────────────────────────────────────
const clienteApi = axios.create({
  baseURL: URL_BASE_API,
  timeout: TIEMPO_ESPERA_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor de Petición ──────────────────────────────────────────────────
// Se ejecuta antes de enviar cada request.
// Si hay token guardado, lo adjunta como Bearer Authorization.
clienteApi.interceptors.request.use(
  async (config) => {
    const token = await almacenamientoObtener(CLAVES_STORAGE.token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de Respuesta ─────────────────────────────────────────────────
// Respuestas 2xx: se devuelven sin modificar.
// Respuestas de error (4xx, 5xx): extrae el mensaje del backend o usa fallback.
// Token expirado (401): limpia sesión automáticamente.
clienteApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // Si el token expiró o es inválido, limpiar la sesión.
    // Un 403 significa permiso denegado por rol, no debe cerrar sesión automáticamente.
    if (status === 401) {
      await almacenamientoEliminar([CLAVES_STORAGE.token, CLAVES_STORAGE.usuario]);
    }

    // Extraer el mensaje de error del backend (campo `mensaje` según la API CDL)
    const mensajeBackend =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      error.response?.data?.error;

    const mensaje = mensajeBackend || error.message || 'Error de conexión con el servidor';
    return Promise.reject(new Error(mensaje));
  }
);

export default clienteApi;
