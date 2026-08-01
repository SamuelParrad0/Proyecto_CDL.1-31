/**
 * SERVICIO DE CARRITO
 * Gestiona el carrito de compras para dos escenarios:
 *   - Usuario no autenticado: carrito local en AsyncStorage
 *   - Usuario autenticado: carrito persistido en el backend
 *
 * Rutas reales del backend CDL:
 *   GET    /api/carrito          → obtener carrito (auth)
 *   POST   /api/carrito          → agregar producto (auth) { productoId, cantidad }
 *   PUT    /api/carrito/:id      → actualizar cantidad (auth) { cantidad }
 *   DELETE /api/carrito/:id      → eliminar item (auth)
 *   DELETE /api/carrito          → vaciar carrito (auth)
 *
 * Respuesta del backend: { ok, items: [...], total, cantidadItems }
 * Cada item tiene: Id_Carrito, Id_Producto, Cantidad_Productos, Precio_Total, producto: { Nombre_Producto, Imagen_Producto, ... }
 */

import clienteApi from '../api/clienteApi';
import { CLAVES_STORAGE } from '../utilidades/constantes';
import { almacenamientoObtener, almacenamientoGuardar } from '../utilidades/almacenamiento';

// ─── Carrito Local ────────────────────────────────────────────────────────────
async function leerCarritoLocal() {
  const raw = await almacenamientoObtener(CLAVES_STORAGE.carritoLocal);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function guardarCarritoLocal(items) {
  await almacenamientoGuardar(CLAVES_STORAGE.carritoLocal, JSON.stringify(items));
}

async function leerClientesCarrito() {
  const raw = await almacenamientoObtener(CLAVES_STORAGE.clientesCarrito);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function guardarClientesCarrito(clientes) {
  await almacenamientoGuardar(CLAVES_STORAGE.clientesCarrito, JSON.stringify(clientes));
}

// ─── Normalización de Items ───────────────────────────────────────────────────
// ─── Normalización de Items ───────────────────────────────────────────────────
// Convierte la estructura del backend a un formato consistente para la UI
function normalizarItem(item, clientesGuardados) {
  const producto = item.producto || item.Producto || {};
  // Soporta tanto la estructura del backend (Precio_Total, Cantidad_Productos)
  // como los items locales (precioUnitario, subtotal).
  const cantidad = Number(item.Cantidad_Productos || item.cantidad || item.Cantidad || 0);
  const precioTotal = Number(item.Precio_Total || item.precioTotal || item.subtotal || item.subTotal || 0);

  let precioUnitario = Number(item.precioUnitario || item.Precio_Unitario || item.precio || item.Precio || 0);
  if (!precioUnitario && cantidad > 0 && precioTotal > 0) {
    precioUnitario = precioTotal / cantidad;
  }
  if (!precioUnitario) {
    precioUnitario = Number(producto.Precio_Producto || producto.precio || 0);
  }

  const productoId = item.Id_Producto || item.productoId || producto.Id_Producto;

  return {
    id: item.Id_Carrito || item.id,
    productoId: productoId,
    nombre: producto.Nombre_Producto || producto.nombre || item.nombre || 'Producto',
    imagen: producto.Imagen_Producto || producto.imagen || item.imagen || null,
    precioUnitario,
    cantidad,
    subtotal: precioTotal || precioUnitario * cantidad,
    stock: Number(item.stock ?? item.Stock ?? (producto.Stock !== undefined ? producto.Stock : 0)),
    cliente: clientesGuardados[productoId] || null,
  };
}

function calcularResumen(items, clientesGuardados) {
  const normalizados = items.map((it) => normalizarItem(it, clientesGuardados));
  const totalItems = normalizados.reduce((acc, item) => acc + item.cantidad, 0);
  const total = normalizados.reduce((acc, item) => acc + item.subtotal, 0);
  return { items: normalizados, totalItems, total };
}

const servicioCarrito = {
  /**
   * Obtiene el carrito completo (backend o local según autenticación).
   */
  obtenerCarrito: async (estaAutenticado) => {
    const clientesGuardados = await leerClientesCarrito();
    if (estaAutenticado) {
      const respuesta = await clienteApi.get('/carrito');
      const datos = respuesta.data;
      const items = datos?.items || datos?.Items || [];
      return calcularResumen(items, clientesGuardados);
    }
    const itemsLocales = await leerCarritoLocal();
    return calcularResumen(itemsLocales, clientesGuardados);
  },

  /**
   * Agrega un producto al carrito.
   */
  agregarAlCarrito: async ({ estaAutenticado, producto, cantidad = 1, datosCliente = null }) => {
    const productoId = producto.Id_Producto || producto.id || producto.productoId;

    if (datosCliente) {
      const clientesGuardados = await leerClientesCarrito();
      clientesGuardados[productoId] = datosCliente;
      await guardarClientesCarrito(clientesGuardados);
    }

    if (estaAutenticado) {
      await clienteApi.post('/carrito', {
        productoId,
        cantidad,
      });
      return;
    }
    const itemsLocales = await leerCarritoLocal();
    // productoId ya fue extraído arriba
    const existente = itemsLocales.find((it) => Number(it.productoId) === Number(productoId));
    if (existente) {
      existente.cantidad += cantidad;
      existente.subtotal = existente.precioUnitario * existente.cantidad;
    } else {
        const precio = Number(producto.Precio_Producto || producto.precio || 0);
        const stock = Number(producto.Stock ?? producto.Stock ?? 0);
        itemsLocales.push({
          id: Date.now(),
          productoId,
          nombre: producto.Nombre_Producto || producto.nombre || 'Producto',
          imagen: producto.Imagen_Producto || producto.imagen || null,
          precioUnitario: precio,
          cantidad,
          subtotal: precio * cantidad,
          stock,
        });
    }
    await guardarCarritoLocal(itemsLocales);
  },

  /**
   * Actualiza la cantidad de un item del carrito.
   */
  actualizarCantidad: async ({ estaAutenticado, itemId, cantidad }) => {
    if (estaAutenticado) {
      await clienteApi.put(`/carrito/${itemId}`, { cantidad });
      return;
    }
    const itemsLocales = await leerCarritoLocal();
    const item = itemsLocales.find((it) => Number(it.id) === Number(itemId));
    if (item) {
      item.cantidad = cantidad;
      item.subtotal = item.precioUnitario * cantidad;
      await guardarCarritoLocal(itemsLocales);
    }
  },

  /**
   * Elimina un item del carrito.
   */
  eliminarItem: async ({ estaAutenticado, itemId }) => {
    if (estaAutenticado) {
      await clienteApi.delete(`/carrito/${itemId}`);
      return;
    }
    const itemsLocales = await leerCarritoLocal();
    const filtrados = itemsLocales.filter((it) => Number(it.id) !== Number(itemId));
    await guardarCarritoLocal(filtrados);
  },

  /**
   * Vacía completamente el carrito.
   */
  vaciarCarrito: async (estaAutenticado) => {
    if (estaAutenticado) {
      await clienteApi.delete('/carrito');
      return;
    }
    await guardarCarritoLocal([]);
  },

  /**
   * Migra los items del carrito local al backend tras iniciar sesión.
   */
  migrarCarritoLocal: async () => {
    const itemsLocales = await leerCarritoLocal();
    if (itemsLocales.length === 0) return;
    for (const item of itemsLocales) {
      try {
        await clienteApi.post('/carrito', {
          productoId: item.productoId,
          cantidad: item.cantidad,
        });
      } catch {
        // Si un item falla (producto eliminado), continúa con el siguiente
      }
    }
    await guardarCarritoLocal([]);
  },
};

export default servicioCarrito;
