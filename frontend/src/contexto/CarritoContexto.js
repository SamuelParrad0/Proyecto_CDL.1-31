import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  obtenerCarritoAPI,
  agregarAlCarritoAPI,
  eliminarDelCarritoAPI,
  actualizarCantidadCarritoAPI,
  vaciarCarritoAPI,
  haySesionActiva
} from '../servicios/api';

const CarritoContexto = createContext(null);

const CART_LOCAL_KEY = 'cdl_carrito_items';

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(false);

  const guardarEnLocal = useCallback((items) => {
    const resumen = items.map(item => ({
      id: item.Id_Carrito,
      productoId: item.Id_Producto || item.producto?.Id_Producto,
      nombre: item.producto?.Nombre_Producto || 'Producto',
      precio: Number(item.producto?.Precio_Producto || 0),
      cantidad: item.Cantidad_Productos || 1,
      precioTotal: Number(item.Precio_Total || 0),
      imagen: item.producto?.Imagen || item.producto?.Imagen_Producto || '',
      cliente: item.cliente || null,
      personalizacion: item.personalizacion || null,
    }));
    localStorage.setItem(CART_LOCAL_KEY, JSON.stringify(resumen));
  }, []);

  const sincronizar = useCallback(async () => {
    if (!haySesionActiva()) {
      setCarrito([]);
      localStorage.removeItem(CART_LOCAL_KEY);
      return;
    }
    try {
      setCargando(true);
      const data = await obtenerCarritoAPI();
      const items = data?.items || data || [];
      setCarrito(items);
      guardarEnLocal(items);
    } catch (error) {
      console.error('Error al sincronizar carrito:', error);
    } finally {
      setCargando(false);
    }
  }, [guardarEnLocal]);

  useEffect(() => {
    sincronizar();
  }, [sincronizar]);

  const agregarItem = useCallback(async (productoId, cantidad = 1, datosCliente = null) => {
    if (!haySesionActiva()) {
      window.location.href = '/login?motivo=compra';
      return false;
    }
    try {
      await agregarAlCarritoAPI({ productoId, cantidad });
      if (datosCliente) {
        const clientesGuardados = JSON.parse(localStorage.getItem('cdl_clientes_carrito') || '{}');
        clientesGuardados[productoId] = datosCliente;
        localStorage.setItem('cdl_clientes_carrito', JSON.stringify(clientesGuardados));
      }
      await sincronizar();
      return true;
    } catch (error) {
      alert(error.message || 'Error al agregar al carrito');
      return false;
    }
  }, [sincronizar]);

  const eliminarItem = useCallback(async (itemId) => {
    try {
      await eliminarDelCarritoAPI(itemId);
      await sincronizar();
    } catch (error) {
      console.error(error);
    }
  }, [sincronizar]);

  const actualizarCantidad = useCallback(async (itemId, cantidad) => {
    try {
      await actualizarCantidadCarritoAPI(itemId, cantidad);
      await sincronizar();
    } catch (error) {
      alert(error.message || 'Error al actualizar la cantidad');
    }
  }, [sincronizar]);

  const vaciarCarrito = useCallback(async () => {
    try {
      await vaciarCarritoAPI();
      setCarrito([]);
      localStorage.removeItem(CART_LOCAL_KEY);
      localStorage.removeItem('cdl_clientes_carrito');
    } catch (error) {
      console.error(error);
    }
  }, []);

  const obtenerCarritoConClientes = useCallback(() => {
    let clientesGuardados = {};
    try {
      clientesGuardados = JSON.parse(localStorage.getItem('cdl_clientes_carrito') || '{}');
    } catch (error) {
      console.error('Error al leer datos de clientes del carrito:', error);
    }

    return carrito.map((item) => ({
      ...item,
      cliente: item.cliente || clientesGuardados[item.Id_Producto] || null
    }));
  }, [carrito]);

  const totalItems = useMemo(() => {
    return carrito.reduce((acc, item) => acc + (Number(item.Cantidad_Productos) || 1), 0);
  }, [carrito]);

  const totalPrecio = useMemo(() => {
    return carrito.reduce((acc, item) => acc + (Number(item.Precio_Total) || 0), 0);
  }, [carrito]);

  const valorContexto = useMemo(() => ({
    carrito,
    agregarItem,
    eliminarItem,
    vaciarCarrito,
    actualizarCantidad,
    sincronizar,
    cargando,
    obtenerCarritoConClientes,
    totalItems,
    totalPrecio
  }), [
    carrito,
    agregarItem,
    eliminarItem,
    vaciarCarrito,
    actualizarCantidad,
    sincronizar,
    cargando,
    obtenerCarritoConClientes,
    totalItems,
    totalPrecio
  ]);

  return (
    <CarritoContexto.Provider value={valorContexto}>
      {children}
    </CarritoContexto.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContexto);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
}