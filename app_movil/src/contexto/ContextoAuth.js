import React, { createContext, useState, useEffect } from 'react';
import servicioAuth from '../servicios/servicioAuth';
import servicioCarrito from '../servicios/servicioCarrito';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Inicializar sesión al cargar la app
  useEffect(() => {
    inicializarSesion();
  }, []);

  const inicializarSesion = async () => {
    try {
      setCargando(true);
      const sesion = await servicioAuth.obtenerSesion();
      if (sesion.token && sesion.usuario) {
        setUsuario(sesion.usuario);
        setEstaAutenticado(true);
      } else {
        setUsuario(null);
        setEstaAutenticado(false);
      }
    } catch (error) {
      console.warn('Error inicializando sesión:', error?.message || error);
      setUsuario(null);
      setEstaAutenticado(false);
    } finally {
      setCargando(false);
    }
  };

  const login = async (correo, password) => {
    try {
      setCargando(true);
      const datos = await servicioAuth.login(correo, password);
      if (datos.usuario) {
        setUsuario(datos.usuario);
        setEstaAutenticado(true);
        // Intentar migrar carrito local al backend
        await servicioCarrito.migrarCarritoLocal();
      }
      return datos;
    } finally {
      setCargando(false);
    }
  };

  const registro = async (datosRegistro) => {
    try {
      setCargando(true);
      const datos = await servicioAuth.registro(datosRegistro);
      if (datos.usuario) {
        setUsuario(datos.usuario);
        setEstaAutenticado(true);
        // Intentar migrar carrito local al backend
        await servicioCarrito.migrarCarritoLocal();
      }
      return datos;
    } finally {
      setCargando(false);
    }
  };

  const logout = async () => {
    try {
      setCargando(true);
      await servicioAuth.cerrarSesion();
      setUsuario(null);
      setEstaAutenticado(false);
    } finally {
      setCargando(false);
    }
  };

  const actualizarPerfil = async (datos) => {
    try {
      setCargando(true);
      const usuarioActualizado = await servicioAuth.actualizarPerfil(datos);
      setUsuario(usuarioActualizado);
      return usuarioActualizado;
    } finally {
      setCargando(false);
    }
  };

  // Propiedad derivada para saber si es admin o auxiliar
  const esAdmin = 
    usuario?.Id_Rol === 1 || 
    usuario?.rol === 'admin' || 
    usuario?.rol === 'administrador' || 
    usuario?.Rol === 'admin' || 
    usuario?.Rol?.Nombre_Rol === 'admin' || 
    usuario?.Rol?.Nombre_Rol === 'administrador';

  const esAuxiliar =
    usuario?.Id_Rol === 3 ||
    usuario?.rol === 'auxiliar' ||
    usuario?.Rol === 'auxiliar' ||
    usuario?.Rol?.Nombre_Rol === 'auxiliar';

  const puedeGestionarPanel = esAdmin || esAuxiliar;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado,
        esAdmin,
        esAuxiliar,
        puedeGestionarPanel,
        cargando,
        login,
        registro,
        logout,
        actualizarPerfil,
        refrescarSesion: inicializarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
