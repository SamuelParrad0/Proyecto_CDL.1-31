import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../estilos/admin.css';
import { 
  listarUsuariosAPI, eliminarUsuarioAPI, actualizarRolAPI, editarUsuarioAPI, toggleUsuarioAPI, listarProductosAdminAPI, crearProductoAPI, actualizarProductoAPI, eliminarProductoAPI, toggleProductoAPI,
  obtenerPaquetesAPI, crearPaqueteAPI, actualizarPaqueteAPI, eliminarPaqueteAPI, togglePaqueteAPI,
  obtenerTodasLasSolicitudesAPI, actualizarEstadoSolicitudAPI,
  editarCitaAPI, toggleCitaAPI, eliminarCitaAPI, editarPedidoAPI, togglePedidoAPI, eliminarPedidoAPI, editarSolicitudAPI, toggleSolicitudAPI, eliminarSolicitudAdminAPI,
  obtenerOpinionesAPI, eliminarOpinionAPI, editarOpinionAPI, toggleOpinionAPI,
  obtenerCategoriasAPI, listarCategoriasAdminAPI, crearCategoriaAPI, actualizarCategoriaAPI, eliminarCategoriaAPI, toggleCategoriaAPI,
  getUsuarioLocal, cerrarSesion
} from '../../servicios/api';

const ESTADOS_PAQUETE = [
  { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
  { value: 'en_contacto', label: 'En contacto contigo', color: '#3b82f6' },
  { value: 'agendada', label: 'Agendada', color: '#a855f7' },
  { value: 'mision_cumplida', label: '¡Misión cumplida!', color: '#22c55e' },
  { value: 'cancelada', label: 'Cancelada', color: '#ef4444' }
];

const ESTADOS_PRODUCTO = [
  { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
  { value: 'pagado', label: '¡Manos a la obra!', color: '#3b82f6' },
  { value: 'enviado', label: 'Viajando hacia ti', color: '#00d9ff' },
  { value: 'entregado', label: '¡Ya contigo!', color: '#22c55e' },
  { value: 'cancelado', label: 'Cancelado', color: '#ef4444' }
];

const ESTADOS_PERSONAL = [
  { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
  { value: 'en-revision', label: 'Analizando tu idea', color: '#3b82f6' },
  { value: 'aprobado', label: 'Creando tu idea junto a ti', color: '#a855f7' },
  { value: 'rechazado', label: 'Dando vida a tu idea', color: '#ff0844' },
  { value: 'completado', label: '¡Tu creación ya está contigo!', color: '#22c55e' },
  { value: 'cancelado', label: 'Cancelado', color: '#ef4444' }
];

const formatearCOP = (valor) => {
  if (valor === undefined || valor === null) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

const normalizarRolWeb = (rol) => {
  if (!rol) return '';
  const valor = String(rol).trim().toLowerCase();
  if (valor === 'administrador' || valor === 'admin') return 'admin';
  if (valor === 'auxiliar') return 'auxiliar';
  return valor;
};

const PaginaAdmin = () => {
  const navigate = useNavigate();
  const [userLocal] = useState(getUsuarioLocal());
  const rolUsuario = normalizarRolWeb(userLocal?.rol || userLocal?.Rol?.Nombre_Rol || userLocal?.Rol || '');
  const esAuxiliar = rolUsuario === 'auxiliar';
  const esAdminGeneral = rolUsuario === 'admin';
  
  // Estados de interfaz
  const [vistaActiva, setVistaActiva] = useState('usuarios');
  const [pestanaSolicitudes, setPestanaSolicitudes] = useState('paquetes');
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'exito' });
  const [dialogo, setDialogo] = useState({ abierto: false, titulo: '', mensaje: '', onConfirm: null, variante: 'peligro' });

  // Estados de datos
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [opiniones, setOpiniones] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState('');
  const [filtroCalificacionOpinion, setFiltroCalificacionOpinion] = useState('');

  // Estados de Modales
  const [modalAbierto, setModalAbierto] = useState(null); // 'usuario' | 'producto' | 'categoria' | 'paquete'
  const [elementoEditable, setElementoEditable] = useState(null);

  // Seguridad
  useEffect(() => {
    if (!userLocal || (!esAdminGeneral && !esAuxiliar)) {
      navigate('/login');
    } else if (esAuxiliar) {
      setVistaActiva('usuarios');
    }
  }, [userLocal, navigate, esAdminGeneral, esAuxiliar]);

  // Carga de datos dinámica
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      let data = [];
      if (vistaActiva === 'usuarios') {
        data = await listarUsuariosAPI();
        setUsuarios(data);
      } else if (vistaActiva === 'productos') {
        // Al cargar productos para admin, usamos la ruta que trae TODOS (incluidos ocultos)
        const [resProd, resCat] = await Promise.all([listarProductosAdminAPI(), obtenerCategoriasAPI()]);
        setProductos(resProd);
        setCategorias(resCat);
      } else if (vistaActiva === 'categorias') {
        data = await listarCategoriasAdminAPI();
        setCategorias(data);
      } else if (vistaActiva === 'paquetes') {
        data = await obtenerPaquetesAPI();
        setPaquetes(data);
      } else if (vistaActiva === 'opiniones') {
        data = await obtenerOpinionesAPI();
        setOpiniones(data);
      } else if (vistaActiva === 'solicitudes') {
        data = await obtenerTodasLasSolicitudesAPI(pestanaSolicitudes);
        setSolicitudes(data);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setCargando(false);
    }
  }, [vistaActiva, pestanaSolicitudes]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const showToast = (mensaje, tipo = 'exito') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: '', tipo: 'exito' }), 6500);
  };

  const pedirConfirmacion = (titulo, mensaje, onConfirm, variante = 'peligro') => {
    setDialogo({ abierto: true, titulo, mensaje, onConfirm, variante });
  };

  // Mostrar diálogo con opciones para seleccionar un rol
  const pedirSeleccionRol = (id, rolActual) => {
    const opciones = ['admin', 'auxiliar', 'cliente'];
    setDialogo({
      abierto: true,
      titulo: 'Seleccionar nuevo rol',
      mensaje: `Rol actual: ${String(rolActual || 'cliente').toUpperCase()}. Elige un rol:`,
      variante: 'info',
      opciones,
      onConfirm: null,
      onSelect: async (nuevoRol) => {
        try {
          setCargando(true);
          await actualizarRolAPI(id, nuevoRol);
          showToast(`Usuario actualizado a ${nuevoRol}`);
          cargarDatos();
        } catch (e) {
          showToast(e.message, 'error');
        } finally {
          setCargando(false);
          setDialogo({ ...dialogo, abierto: false });
        }
      }
    });
  };

  // --- HANDLERS USUARIOS ---
  const cambiarRolUsuario = (id, rolActual) => {
    // Solo admin puede abrir selector avanzado; auxiliar no debe ver el control (ya controlado en render)
    pedirSeleccionRol(id, rolActual);
  };

  const eliminarUsuario = async (id) => {
    pedirConfirmacion(
      '¿Eliminar usuario?',
      'Esta acción no se puede deshacer. El usuario perderá acceso permanentemente.',
      async () => {
        try {
          await eliminarUsuarioAPI(id);
          showToast('Usuario eliminado');
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  // --- HANDLERS PAQUETES ---
  const handleGuardarPaquete = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    try {
      if (elementoEditable) {
        await actualizarPaqueteAPI(elementoEditable.Id_Paquete, {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio: Number(datos.precio),
          imagen: datos.imagen
        });
        showToast(`✏️ Paquete "${datos.nombre}" editado correctamente`);
      } else {
        await crearPaqueteAPI({
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio: Number(datos.precio),
          imagen: datos.imagen
        });
        showToast(`✅ Paquete "${datos.nombre}" creado exitosamente`);
      }
      setModalAbierto(null);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    try {
      const payload = {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: Number(datos.precio),
        stock: Number(datos.stock || 0),
        imagen: datos.imagen,
        categoriaId: Number(datos.categoriaId), // Añadido para que coincida con la API
        Activo: true
      };
      if (elementoEditable) {
        await actualizarProductoAPI(elementoEditable.Id_Producto, payload);
        showToast(`✏️ Producto "${datos.nombre}" editado correctamente`);
      } else {
        await crearProductoAPI(payload);
        showToast(`✅ Producto "${datos.nombre}" creado exitosamente`);
      }
      setModalAbierto(null);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleToggleProducto = async (id) => {
    const producto = productos.find(p => p.Id_Producto === id);
    const nombreProd = producto?.Nombre_Producto || 'Producto';
    const estaActivo = producto?.Activo;
    try {
      await toggleProductoAPI(id);
      showToast(estaActivo ? `🔒 "${nombreProd}" oculto — ya no aparece en la tienda` : `🔓 "${nombreProd}" visible — ya aparece en la tienda`);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarProducto = (id) => {
    const producto = productos.find(p => p.Id_Producto === id);
    const nombreProd = producto?.Nombre_Producto || 'este producto';
    pedirConfirmacion(
      '¿Eliminar producto?',
      `Estás a punto de eliminar "${nombreProd}". Esta acción no se puede deshacer.`,
      async () => {
        try {
          await eliminarProductoAPI(id);
          showToast(`🗑️ Producto "${nombreProd}" eliminado permanentemente`);
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  // --- HANDLERS CATEGORÍAS ---
  const handleGuardarCategoria = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    datos.Activo = true;
    try {
      if (elementoEditable) {
        await actualizarCategoriaAPI(elementoEditable.Id_Categoria, datos);
        showToast(`✏️ Categoría "${datos.nombre}" editada correctamente`);
      } else {
        await crearCategoriaAPI(datos);
        showToast(`✅ Categoría "${datos.nombre}" creada exitosamente`);
      }
      setModalAbierto(null);
      cargarDatos();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleCategoria = async (id) => {
    const cat = categorias.find(c => c.Id_Categoria === id);
    const nombreCat = cat?.Nombre_Categoria || 'Categoría';
    const estaActiva = cat?.Activo;
    try {
      await toggleCategoriaAPI(id);
      showToast(estaActiva ? `🔒 "${nombreCat}" desactivada — ya no es visible` : `🔓 "${nombreCat}" activada — ahora es visible`);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarCategoria = (id) => {
    const cat = categorias.find(c => c.Id_Categoria === id);
    const nombreCat = cat?.Nombre_Categoria || 'esta categoría';
    pedirConfirmacion(
      '¿Eliminar categoría?',
      `Estás a punto de eliminar "${nombreCat}". Si tiene productos asociados podría ocasionar conflictos.`,
      async () => {
        try {
          await eliminarCategoriaAPI(id);
          showToast(`🗑️ Categoría "${nombreCat}" eliminada permanentemente`);
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  const handleTogglePaquete = async (id) => {
    const paquete = paquetes.find(p => p.Id_Paquete === id);
    const nombrePaq = paquete?.Nombre_Paquete || 'Paquete';
    const estaActivo = paquete?.Activo;
    try {
      await togglePaqueteAPI(id);
      showToast(estaActivo ? `🔒 "${nombrePaq}" desactivado — ya no es visible para los clientes` : `🔓 "${nombrePaq}" activado — ahora es visible para los clientes`);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarPaquete = (id) => {
    const paquete = paquetes.find(p => p.Id_Paquete === id);
    const nombrePaq = paquete?.Nombre_Paquete || 'este paquete';
    pedirConfirmacion(
      '¿Eliminar paquete?',
      `Estás a punto de eliminar "${nombrePaq}". Esta acción no se puede deshacer.`,
      async () => {
        try {
          await eliminarPaqueteAPI(id);
          showToast(`🗑️ Paquete "${nombrePaq}" eliminado permanentemente`);
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  // --- HANDLERS SOLICITUDES ---
  const handleCambiarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoSolicitudAPI(pestanaSolicitudes, id, nuevoEstado);
      showToast('Estado actualizado');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleGuardarSolicitudEspecifica = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    try {
      if (pestanaSolicitudes === 'paquetes') {
        await editarCitaAPI(elementoEditable.Id_Reserva_Paquete, datos);
      } else if (pestanaSolicitudes === 'productos') {
        await editarPedidoAPI(elementoEditable.id, datos);
      } else {
        await editarSolicitudAPI(elementoEditable.Id_Personalizado, datos);
      }
      showToast('Registro editado correctamente');
      setModalAbierto(null);
      cargarDatos();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleSolicitudEspecifica = async (id) => {
    try {
      if (pestanaSolicitudes === 'paquetes') await toggleCitaAPI(id);
      else if (pestanaSolicitudes === 'productos') await togglePedidoAPI(id);
      else await toggleSolicitudAPI(id);
      showToast('Estado actualizado (Cancelado/Pendiente)');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarSolicitud = (id) => {
    const tipo = pestanaSolicitudes;
    const nombreTipo = tipo === 'paquetes' ? 'Cita' : tipo === 'productos' ? 'Pedido' : 'Solicitud personalizado';
    const nombreTipoMinuscula = tipo === 'paquetes' ? 'cita' : tipo === 'productos' ? 'pedido' : 'solicitud personalizado';

    pedirConfirmacion(
      `¿Eliminar ${nombreTipo}?`,
      `Estás a punto de eliminar esta ${nombreTipoMinuscula}. Esta acción no se puede deshacer.`,
      async () => {
        try {
          if (tipo === 'paquetes') await eliminarCitaAPI(id);
          else if (tipo === 'productos') await eliminarPedidoAPI(id);
          else await eliminarSolicitudAdminAPI(id);
          showToast(`${nombreTipo} eliminada correctamente`);
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    try {
      await editarUsuarioAPI(elementoEditable.Id_Usuario, datos);
      showToast('Usuario editado correctamente');
      setModalAbierto(null);
      cargarDatos();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleUsuario = async (id) => {
    try {
      await toggleUsuarioAPI(id);
      showToast('Estado del usuario actualizado');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleGuardarOpinion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    try {
      await editarOpinionAPI(elementoEditable.Id_Reseña, datos);
      showToast('Opinión editada correctamente');
      setModalAbierto(null);
      cargarDatos();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleOpinion = async (id) => {
    try {
      await toggleOpinionAPI(id);
      showToast('Visibilidad de la opinión actualizada');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const countSolicitudes = solicitudes.length;

  const filteredData = () => {
    const text = busqueda.toLowerCase();
    if (vistaActiva === 'usuarios') return usuarios.filter(u => (u.Nombre || '').toLowerCase().includes(text) || (u.Correo || '').toLowerCase().includes(text));
    if (vistaActiva === 'paquetes') return paquetes.filter(p => (p.Nombre_Paquete || '').toLowerCase().includes(text));
    if (vistaActiva === 'productos') return productos.filter(p => (p.Nombre_Producto || '').toLowerCase().includes(text));
    if (vistaActiva === 'categorias') return categorias.filter(c => (c.Nombre_Categoria || '').toLowerCase().includes(text) || (c.Descripcion_Categoria || '').toLowerCase().includes(text));
    
    if (vistaActiva === 'solicitudes') {
      return solicitudes.filter(s => {
        const id = String(s.Id_Reserva_Paquete || s.id || s.Id_Personalizado || '');
        const nombre = (s.Nombre_Completo || s.usuario?.Nombre || '').toLowerCase();
        const correo = (s.Correo || s.usuario?.Correo || '').toLowerCase();
        const estado = s.Estado_Reserva_Paquete || s.estado || s.Estado_Personalizado;
        
        const cumpleBusqueda = id.includes(text) || nombre.includes(text) || correo.includes(text);
        const cumpleFiltro = filtroEstadoSolicitud ? estado === filtroEstadoSolicitud : true;
        
        return cumpleBusqueda && cumpleFiltro;
      });
    }

    if (vistaActiva === 'opiniones') {
      return opiniones.filter(o => {
        const id = String(o.Id_Reseña || '');
        const nombre = (o.Nombre_Usuario || '').toLowerCase();
        const calificacion = o.Calificacion;
        
        const cumpleBusqueda = id.includes(text) || nombre.includes(text);
        const cumpleFiltro = filtroCalificacionOpinion ? String(calificacion) === filtroCalificacionOpinion : true;
        
        return cumpleBusqueda && cumpleFiltro;
      });
    }

    return [];
  };

  return (
    <div className="pagina-admin-root">
      {/* SIDEBAR */}
      <aside className="menu-lateral">
        <div className="menu-lateral__contenedor-logo">
          <div className="menu-lateral__texto-logo"><span>Admin</span></div>
          <p style={{fontSize:'0.6rem', opacity:0.5, letterSpacing:'2px'}}>CONTROL PANEL</p>
        </div>
        <nav className="menu-lateral__navegacion">
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'usuarios' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('usuarios')}>
            <i className="fas fa-users"></i> Usuarios
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'paquetes' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('paquetes')}>
            <i className="fas fa-camera"></i> Paquetes
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'productos' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('productos')}>
            <i className="fas fa-box"></i> Productos
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'categorias' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('categorias')}>
            <i className="fas fa-tags"></i> Categorías
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'solicitudes' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('solicitudes')}>
            <i className="fas fa-envelope-open-text"></i> Solicitudes
            {countSolicitudes > 0 && <span className="menu-lateral__contador-pendientes">{countSolicitudes}</span>}
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'opiniones' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('opiniones')}>
            <i className="fas fa-star"></i> Opiniones
          </button>
        </nav>
        <div className="menu-lateral__pie" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
           <button 
             type="button"
             className="menu-lateral__informacion-admin" 
             onClick={() => navigate('/')} 
             style={{
               cursor:'pointer', padding:'10px 12px', borderRadius:'14px', 
               background:'rgba(0,217,255,0.04)', border:'1px solid rgba(0,217,255,0.1)',
               transition:'all 0.3s ease'
             }}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,217,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,217,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,217,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,217,255,0.1)'; e.currentTarget.style.transform = 'none'; }}
           >
             <div className="menu-lateral__avatar-admin" style={{background:'linear-gradient(135deg, rgba(0,217,255,0.2), rgba(0,217,255,0.05))', color:'var(--cian)', boxShadow:'0 0 12px rgba(0,217,255,0.15)', border:'1px solid rgba(0,217,255,0.25)'}}>
               <i className="fas fa-home"></i>
             </div>
             <div>
               <div className="menu-lateral__nombre-admin" style={{color:'#fff', fontSize:'0.85rem', marginBottom:'2px'}}>Ver Página</div>
               <div className="menu-lateral__rol-admin" style={{color:'var(--cian)', opacity:0.8}}>Ir a la tienda</div>
             </div>
           </button>

           <button 
             type="button"
             className="menu-lateral__informacion-admin" 
             onClick={() => {cerrarSesion(); navigate('/login');}} 
             style={{
               cursor:'pointer', padding:'10px 12px', borderRadius:'14px', 
               background:'rgba(255,8,68,0.04)', border:'1px solid rgba(255,8,68,0.1)',
               transition:'all 0.3s ease'
             }}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,8,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,8,68,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,8,68,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,8,68,0.1)'; e.currentTarget.style.transform = 'none'; }}
           >
             <div className="menu-lateral__avatar-admin" style={{background:'linear-gradient(135deg, rgba(255,8,68,0.2), rgba(255,8,68,0.05))', color:'var(--rojo)', boxShadow:'0 0 12px rgba(255,8,68,0.15)', border:'1px solid rgba(255,8,68,0.25)'}}>
               {userLocal?.Nombre?.[0] || 'A'}
             </div>
             <div>
               <div className="menu-lateral__nombre-admin" style={{color:'#fff', fontSize:'0.85rem', marginBottom:'2px'}}>{esAuxiliar ? 'Auxiliar' : 'Admin'}</div>
               <div className="menu-lateral__rol-admin" style={{color:'var(--rojo)', opacity:0.8}}>Cerrar Sesión</div>
             </div>
           </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="area-contenido">
        <header className="barra-encabezado">
          <div className="barra-encabezado__titulo" style={{textTransform:'uppercase'}}>
            Gestión de <span>{esAuxiliar ? 'solicitudes' : vistaActiva}</span>
          </div>
          <div className="barra-encabezado__acciones">
            <div className="indicador-sistema-activo"></div>
            <span style={{fontSize:'10px', letterSpacing:'1px'}}>ONLINE</span>
          </div>
        </header>

        <div className="contenedor-secciones">
          {cargando ? (
            <div style={{textAlign:'center', marginTop:'5rem'}}>
               <i className="fas fa-sync fa-spin fa-2x" style={{color:'var(--rojo)'}}></i>
               <p style={{marginTop:'1rem', fontFamily:'Rajdhani'}}>Sincronizando con base de datos...</p>
            </div>
          ) : (
            <>
              {/* VISTA USUARIOS */}
              {vistaActiva === 'usuarios' && (
                <div>
                  <div className="barra-busqueda-filtros" style={{marginBottom:'2rem'}}>
                    <div className="contenedor-campo-busqueda">
                      <i className="fas fa-search"></i>
                      <input className="campo-busqueda-texto" type="text" placeholder="Buscar usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                  </div>
                  <div className="cuadricula-general">
                    {filteredData().map(u => (
                    <div key={u.Id_Usuario} className="tarjeta-admin">
                      <div className="tarjeta-admin__barra"></div>
                      <div className="tarjeta-admin__cuerpo">
                        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem'}}>
                          <div className="menu-lateral__avatar-admin" style={{width:'40px', height:'40px'}}>{u.Nombre[0]}</div>
                          <div>
                            <div style={{fontWeight:700}}>{u.Nombre} {u.Apellidos}</div>
                            <span className={`etiqueta-rol ${u.Rol?.Nombre_Rol === 'admin' || u.Rol?.Nombre_Rol === 'administrador' ? 'etiqueta-rol--administrador' : 'etiqueta-rol--cliente'}`}>
                              {u.Rol?.Nombre_Rol || 'cliente'}
                            </span>
                          </div>
                        </div>
                        <div style={{fontSize:'0.8rem', opacity:0.7}}>{u.Correo}</div>
                        <div style={{fontSize:'0.8rem', opacity:0.7}}>{u.Celular}</div>
                      </div>
                        <div style={{padding:'1rem', background:'rgba(0,0,0,0.2)', display:'flex', gap:'5px', flexWrap:'wrap'}}>
                        <button type="button" className="boton-accion" onClick={() => {setElementoEditable(u); setModalAbierto('usuario');}} title="Editar Usuario">
                          <i className="fas fa-pen"></i>
                        </button>
                        {!esAuxiliar && (
                          <button type="button" className="boton-accion boton-accion--editar" onClick={() => cambiarRolUsuario(u.Id_Usuario, u.Rol?.Nombre_Rol)} title="Cambiar Rol">
                            <i className="fas fa-user-shield"></i>
                          </button>
                        )}
                        {esAdminGeneral && (
                          <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => eliminarUsuario(u.Id_Usuario)} title="Eliminar Usuario">
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                        <button type="button" className={`boton-accion ${u.Activo === false ? 'boton-accion--activar' : 'boton-accion--desactivar'}`} onClick={() => handleToggleUsuario(u.Id_Usuario)} title={u.Activo === false ? 'Activar Usuario' : 'Desactivar Usuario'}>
                          <i className={`fas fa-${u.Activo === false ? 'user-check' : 'user-times'}`}></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* VISTA PAQUETES */}
              {vistaActiva === 'paquetes' && (
                <div>
                   <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
                      <button type="button" className="boton-accion boton-accion--guardar" onClick={() => {setElementoEditable(null); setModalAbierto('paquete');}}>
                        <i className="fas fa-plus"></i> Nuevo Paquete
                      </button>
                      <div className="contenedor-campo-busqueda">
                        <i className="fas fa-search"></i>
                        <input className="campo-busqueda-texto" type="text" placeholder="Buscar paquete..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                      </div>
                   </div>
                   <div className="cuadricula-general">
                    {filteredData().map(p => (
                      <div key={p.Id_Paquete} className="tarjeta-admin">
                        <div className="tarjeta-admin__barra"></div>
                        <div className="tarjeta-admin__cuerpo">
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                             <div style={{fontFamily:'Bebas Neue', fontSize:'1.5rem'}}>{p.Nombre_Paquete}</div>
                             <span className={p.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{fontSize:'9px'}}>
                                {p.Activo ? 'ACTIVO' : 'OCULTO'}
                             </span>
                           </div>
                           <div style={{color:'var(--rojo)', fontWeight:700, margin:'5px 0'}}>{formatearCOP(p.Precio_Paquete)}</div>
                           <p style={{fontSize:'0.75rem', opacity:0.7}}>{p.Descripcion_Paquete}</p>
                        </div>
                        <div style={{padding:'1rem', background:'rgba(0,0,0,0.2)', display:'flex', gap:'10px'}}>
                           <button type="button" className="boton-accion" onClick={() => {setElementoEditable(p); setModalAbierto('paquete');}}>
                             <i className="fas fa-pen"></i>
                           </button>
                           <button type="button" className={`boton-accion ${p.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => handleTogglePaquete(p.Id_Paquete)}>
                             <i className={`fas fa-${p.Activo ? 'eye-slash' : 'eye'}`}></i>
                           </button>
                           {!esAuxiliar && (
                             <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => handleEliminarPaquete(p.Id_Paquete)}>
                               <i className="fas fa-trash"></i>
                             </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA PRODUCTOS */}
              {vistaActiva === 'productos' && (
                <div>
                  <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
                    <button type="button" className="boton-accion boton-accion--guardar" onClick={() => {setElementoEditable(null); setModalAbierto('producto');}}>
                      <i className="fas fa-plus"></i> Nuevo Producto
                    </button>
                    <div className="contenedor-campo-busqueda">
                        <i className="fas fa-search"></i>
                        <input className="campo-busqueda-texto" type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                  </div>
                  <div className="cuadricula-general">
                    {filteredData().map(p => (
                      <div key={p.Id_Producto} className="tarjeta-admin">
                        <div className="tarjeta-admin__barra" style={{background:'linear-gradient(90deg, var(--cian), var(--rojo))'}}></div>
                        <div className="tarjeta-admin__cuerpo">
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                             <div style={{fontFamily:'Bebas Neue', fontSize:'1.5rem'}}>{p.Nombre_Producto}</div>
                             <span className={p.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{fontSize:'9px'}}>
                                {p.Activo ? 'ACTIVO' : 'OCULTO'}
                             </span>
                           </div>
                           <div style={{color:'var(--cian)', fontWeight:700, margin:'5px 0'}}>{formatearCOP(p.Precio_Producto)}</div>
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', margin: '8px 0'}}>
                             <div style={{fontSize:'0.8rem', fontWeight:600, color:'#ccc'}}>Stock: <span style={{color:'#fff'}}>{p.Stock || 0}</span></div>
                             {p.Stock <= 0 ? (
                               <span style={{fontSize:'9px', padding:'3px 6px', borderRadius:'4px', background:'#ff0844', color:'#fff', fontWeight:'bold'}}>AGOTADO</span>
                             ) : p.Stock <= 5 ? (
                               <span style={{fontSize:'9px', padding:'3px 6px', borderRadius:'4px', background:'#f59e0b', color:'#fff', fontWeight:'bold'}}>STOCK BAJO</span>
                             ) : (
                               <span style={{fontSize:'9px', padding:'3px 6px', borderRadius:'4px', background:'#22c55e', color:'#fff', fontWeight:'bold'}}>DISPONIBLE</span>
                             )}
                           </div>
                           <p style={{fontSize:'0.75rem', opacity:0.7}}>{p.Descripcion_Producto}</p>
                        </div>
                        <div style={{padding:'1rem', background:'rgba(0,0,0,0.2)', display:'flex', gap:'10px'}}>
                           <button type="button" className="boton-accion" onClick={() => {setElementoEditable(p); setModalAbierto('producto');}}>
                             <i className="fas fa-pen"></i>
                           </button>
                           <button type="button" className={`boton-accion ${p.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => handleToggleProducto(p.Id_Producto)}>
                             <i className={`fas fa-${p.Activo ? 'eye-slash' : 'eye'}`}></i>
                           </button>
                           {!esAuxiliar && (
                             <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => handleEliminarProducto(p.Id_Producto)}>
                               <i className="fas fa-trash"></i>
                             </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA CATEGORÍAS */}
              {vistaActiva === 'categorias' && (
                <div>
                  <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
                    <button type="button" className="boton-accion boton-accion--guardar" onClick={() => {setElementoEditable(null); setModalAbierto('categoria');}}>
                      <i className="fas fa-plus"></i> Nueva Categoría
                    </button>
                    <div className="contenedor-campo-busqueda">
                        <i className="fas fa-search"></i>
                        <input className="campo-busqueda-texto" type="text" placeholder="Buscar categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                  </div>
                  <div className="cuadricula-general">
                    {filteredData().map(c => (
                      <div key={c.Id_Categoria} className="tarjeta-admin">
                        <div className="tarjeta-admin__barra" style={{background:'linear-gradient(90deg, #8A2BE2, #FF00FF)'}}></div>
                        <div className="tarjeta-admin__cuerpo">
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                             <div style={{fontFamily:'Bebas Neue', fontSize:'1.5rem'}}>{c.Nombre_Categoria}</div>
                             <span className={c.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{fontSize:'9px'}}>
                                {c.Activo ? 'ACTIVA' : 'OCULTA'}
                             </span>
                           </div>
                           <p style={{fontSize:'0.75rem', opacity:0.7, marginTop:'10px'}}>{c.Descripcion_Categoria || 'Sin descripción'}</p>
                        </div>
                        <div style={{padding:'1rem', background:'rgba(0,0,0,0.2)', display:'flex', gap:'10px'}}>
                           <button type="button" className="boton-accion" onClick={() => {setElementoEditable(c); setModalAbierto('categoria');}}>
                             <i className="fas fa-pen"></i>
                           </button>
                           <button type="button" className={`boton-accion ${c.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => handleToggleCategoria(c.Id_Categoria)}>
                             <i className={`fas fa-${c.Activo ? 'eye-slash' : 'eye'}`}></i>
                           </button>
                           {!esAuxiliar && (
                             <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => handleEliminarCategoria(c.Id_Categoria)}>
                               <i className="fas fa-trash"></i>
                             </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA SOLICITUDES */}
              {vistaActiva === 'solicitudes' && (
                <div>
                  <div className="barra-busqueda-filtros" style={{marginBottom:'1.5rem', display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'space-between', alignItems:'center'}}>
                    <div className="barra-pestanas" style={{margin:0}}>
                      <button type="button" className={`pestana-boton ${pestanaSolicitudes === 'paquetes' && 'pestana-boton--activa'}`} onClick={() => {setPestanaSolicitudes('paquetes'); setFiltroEstadoSolicitud('');}}>Citas</button>
                      <button type="button" className={`pestana-boton ${pestanaSolicitudes === 'productos' && 'pestana-boton--activa'}`} onClick={() => {setPestanaSolicitudes('productos'); setFiltroEstadoSolicitud('');}}>Pedidos</button>
                      <button type="button" className={`pestana-boton ${pestanaSolicitudes === 'personalizado' && 'pestana-boton--activa'}`} onClick={() => {setPestanaSolicitudes('personalizado'); setFiltroEstadoSolicitud('');}}>Personalizado</button>
                    </div>
                    <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                      <div className="contenedor-campo-busqueda" style={{flex:1}}>
                          <i className="fas fa-search"></i>
                          <input className="campo-busqueda-texto" type="text" placeholder="Buscar por ID, nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                      </div>
                      <select 
                        style={{padding:'10px', background:'var(--bg-1)', color:'#fff', border:'1px solid var(--borde)', borderRadius:'6px'}}
                        value={filtroEstadoSolicitud} 
                        onChange={(e) => setFiltroEstadoSolicitud(e.target.value)}
                      >
                        <option value="" style={{ background: 'var(--bg-1)', color: '#fff' }}>Todos los estados</option>
                        {(pestanaSolicitudes === 'paquetes' ? ESTADOS_PAQUETE : pestanaSolicitudes === 'productos' ? ESTADOS_PRODUCTO : ESTADOS_PERSONAL).map(e => (
                          <option key={e.value} value={e.value} style={{ background: 'var(--bg-1)', color: '#fff' }}>{e.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="cuadricula-general">
                    {filteredData().map(s => {
                      const id = s.Id_Reserva_Paquete || s.id || s.Id_Personalizado;
                      const estado = s.Estado_Reserva_Paquete || s.estado || s.Estado_Personalizado;
                      const nombre = s.Nombre_Completo || s.usuario?.Nombre || 'Cliente sin nombre';
                      const correo = s.Correo || s.usuario?.Correo || 'Sin correo asociado';
                      const telefono = s.Numero_Telefono || s.telefono || s.usuario?.Celular || 'N/A';

                      return (
                        <div key={id} className="tarjeta-admin" style={{borderTop: '3px solid var(--rojo)'}}>
                          <div className="tarjeta-admin__cuerpo">
                            {/* ENCABEZADO CLIENTE */}
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'15px'}}>
                              <div>
                                <div style={{fontWeight:700, fontSize:'1.1rem'}}>{nombre}</div>
                                <div style={{fontSize:'0.8rem', opacity:0.7}}><i className="fas fa-envelope"></i> {correo}</div>
                                <div style={{fontSize:'0.8rem', opacity:0.7}}><i className="fas fa-phone"></i> {telefono}</div>
                                <div style={{fontSize:'0.7rem', opacity:0.5, marginTop:'4px'}}>
                                  <i className="fas fa-clock"></i> Creado: {new Date(s.Fecha_Reserva || s.createdAt || s.Fecha_Solicitud).toLocaleString()}
                                </div>
                              </div>
                              <div style={{background: 'rgba(255,8,68,0.1)', color: 'var(--rojo)', padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold'}}>
                                #{id}
                              </div>
                            </div>

                            <hr style={{borderColor: 'rgba(255,255,255,0.05)', margin: '15px 0'}} />

                            {/* DETALLES ESPECÍFICOS SEGÚN TIPO */}
                            <div style={{marginBottom:'20px'}}>
                              
                              {/* --- CITAS (PAQUETES) --- */}
                              {pestanaSolicitudes === 'paquetes' && (
                                <div style={{fontSize:'0.85rem'}}>
                                  <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                                    <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🎯 PAQUETE SOLICITADO</div>
                                    <div style={{fontWeight:'bold'}}>{s.paquete?.Nombre_Paquete || 'Paquete Eliminado'}</div>
                                    <div style={{color:'var(--rojo)'}}>{formatearCOP(s.paquete?.Precio_Paquete)}</div>
                                  </div>
                                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                                    <div><strong>Tipo de Evento:</strong> <br/>{s.Tipo_Evento || 'No especificado'}</div>
                                    <div><strong>Fecha del Evento:</strong> <br/>{s.Fecha_Evento || 'No especificada'}</div>
                                    <div><strong>Invitados:</strong> <br/>{s.Numero_Invitados || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <strong>Información Adicional:</strong>
                                    <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{s.Informacion_Adicional || 'Sin notas adicionales.'}</p>
                                  </div>
                                </div>
                              )}

                              {/* --- PEDIDOS (PRODUCTOS) --- */}
                              {pestanaSolicitudes === 'productos' && (
                                <div style={{fontSize:'0.85rem'}}>
                                  <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                                    <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>📍 DATOS DE ENVÍO</div>
                                    <div style={{opacity:0.9}}>{s.direccionEnvio || 'Sin dirección ingresada'}</div>
                                    {s.notas && <div style={{marginTop:'5px', color:'#ccc'}}><em>Notas: {s.notas}</em></div>}
                                  </div>
                                  <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🛒 PRODUCTOS ({s.detalles ? s.detalles.length : 0})</div>
                                  <div style={{maxHeight:'120px', overflowY:'auto', background:'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'6px', marginBottom:'10px'}}>
                                    {s.detalles && s.detalles.length > 0 ? s.detalles.map(d => (
                                      <div key={d.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'4px'}}>
                                        <div>
                                          <div style={{fontWeight:'bold'}}>{d.producto?.Nombre_Producto || 'Producto eliminado'}</div>
                                          <div style={{fontSize:'0.75rem', opacity:0.7}}>Cant: {d.cantidad} x {formatearCOP(d.precioUnitario)}</div>
                                        </div>
                                        <div style={{fontWeight:'bold', color:'var(--blanco)'}}>{formatearCOP(d.subtotal)}</div>
                                      </div>
                                    )) : <div style={{opacity:0.5}}>No hay detalles.</div>}
                                  </div>
                                  <div style={{textAlign:'right', fontWeight:'bold', fontSize:'1.1rem', color:'var(--cian)'}}>
                                    TOTAL: {formatearCOP(s.total)}
                                  </div>
                                </div>
                              )}

                              {/* --- PERSONALIZADO --- */}
                              {pestanaSolicitudes === 'personalizado' && (
                                <div style={{fontSize:'0.85rem'}}>
                                  <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                                     <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🎁 DESTINATARIO</div>
                                     <div style={{textTransform:'uppercase', fontWeight:'bold'}}>{(s.Destinatario || '').replace('_', ' ')}</div>
                                  </div>
                                  <div style={{marginBottom:'10px'}}>
                                    <strong><i className="fas fa-lightbulb"></i> Idea Principal:</strong>
                                    <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{s.Descripcion_Idea}</p>
                                  </div>
                                  <div style={{marginBottom:'10px'}}>
                                    <strong><i className="fas fa-puzzle-piece"></i> Elementos Esenciales:</strong>
                                    <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{s.Elementos_Esenciales}</p>
                                  </div>
                                  <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'5px', marginBottom:'10px'}}>
                                    <div><strong>Prioridad:</strong> <span style={{background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'3px'}}>{(s.Prioridad_Cliente || 'normal').toUpperCase()}</span></div>
                                  </div>
                                  {s.Comentarios_Adicionales && (
                                    <div>
                                      <strong>Comentarios:</strong>
                                      <p style={{opacity:0.8, marginTop:'3px'}}>{s.Comentarios_Adicionales}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* SELECTOR DE ESTADO */}
                            <div style={{fontSize:'0.75rem', fontWeight:'bold', marginBottom:'5px', color:'var(--rojo)'}}>ACTUALIZAR ESTADO:</div>
                            <select 
                              className="selector-estado-solicitud"
                              value={estado}
                              onChange={(e) => handleCambiarEstadoSolicitud(id, e.target.value)}
                              style={{width:'100%', padding:'10px', background: (pestanaSolicitudes === 'paquetes' ? ESTADOS_PAQUETE : pestanaSolicitudes === 'productos' ? ESTADOS_PRODUCTO : ESTADOS_PERSONAL).find(x => x.value === estado)?.color + '20' || 'var(--bg-1)', color: (pestanaSolicitudes === 'paquetes' ? ESTADOS_PAQUETE : pestanaSolicitudes === 'productos' ? ESTADOS_PRODUCTO : ESTADOS_PERSONAL).find(x => x.value === estado)?.color || '#fff', border: `1px solid ${(pestanaSolicitudes === 'paquetes' ? ESTADOS_PAQUETE : pestanaSolicitudes === 'productos' ? ESTADOS_PRODUCTO : ESTADOS_PERSONAL).find(x => x.value === estado)?.color || 'var(--borde)'}`, borderRadius:'6px'}}
                            >
                               {(pestanaSolicitudes === 'paquetes' ? ESTADOS_PAQUETE : pestanaSolicitudes === 'productos' ? ESTADOS_PRODUCTO : ESTADOS_PERSONAL).map(e => (
                                 <option key={e.value} value={e.value} style={{ background: 'var(--bg-1)', color: '#fff' }}>{e.label}</option>
                               ))}
                            </select>
                            <div style={{display:'flex', gap:'5px', marginTop:'10px'}}>
                              <button type="button" className="boton-accion" style={{flex:1}} onClick={() => {setElementoEditable(s); setModalAbierto('solicitud');}}>
                                <i className="fas fa-pen"></i> Editar
                              </button>
                              <button type="button" className={`boton-accion ${estado === 'cancelado' || estado === 'cancelada' ? 'boton-accion--activar' : 'boton-accion--eliminar'}`} style={{flex:1}} onClick={() => handleToggleSolicitudEspecifica(id)}>
                                <i className="fas fa-ban"></i> {estado === 'cancelado' || estado === 'cancelada' ? 'Restaurar' : 'Cancelar'}
                              </button>
                              {!esAuxiliar && (
                                <button type="button" className="boton-accion boton-accion--eliminar" style={{flex:1}} onClick={() => handleEliminarSolicitud(id)}>
                                  <i className="fas fa-trash"></i> Eliminar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VISTA OPINIONES */}
              {vistaActiva === 'opiniones' && (
                <div>
                  <div className="barra-busqueda-filtros" style={{marginBottom:'1.5rem', display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'space-between'}}>
                    <div className="contenedor-campo-busqueda" style={{flex:1}}>
                        <i className="fas fa-search"></i>
                        <input className="campo-busqueda-texto" type="text" placeholder="Buscar por ID o nombre de usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                    <select 
                      style={{padding:'10px', background:'var(--bg-1)', color:'#fff', border:'1px solid var(--borde)', borderRadius:'6px'}}
                      value={filtroCalificacionOpinion} 
                      onChange={(e) => setFiltroCalificacionOpinion(e.target.value)}
                    >
                      <option value="">Todas las calificaciones</option>
                      <option value="5">5 Estrellas</option>
                      <option value="4">4 Estrellas</option>
                      <option value="3">3 Estrellas</option>
                      <option value="2">2 Estrellas</option>
                      <option value="1">1 Estrella</option>
                    </select>
                  </div>
                  <div className="cuadricula-general">
                     {filteredData().map(o => (
                     <div key={o.Id_Reseña} className="tarjeta-admin">
                        <div className="tarjeta-admin__cuerpo">
                           <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                              <div style={{fontWeight:700}}>{o.Nombre_Usuario}</div>
                              <div style={{color:'var(--rojo)'}}>{'★'.repeat(o.Calificacion)}</div>
                           </div>
                           <p style={{fontSize:'0.85rem', fontStyle:'italic', opacity:0.8}}>"{o.Comentario}"</p>
                        </div>
                        <div style={{padding:'0.8rem', background:'rgba(0,0,0,0.2)', display: 'flex', gap: '5px'}}>
                           <button type="button" className="boton-accion" onClick={() => {setElementoEditable(o); setModalAbierto('opinion');}}>
                             <i className="fas fa-pen"></i>
                           </button>
                           <button type="button" className={`boton-accion ${o.Activo === false ? 'boton-accion--activar' : 'boton-accion--desactivar'}`} onClick={() => handleToggleOpinion(o.Id_Reseña)}>
                             <i className={`fas fa-${o.Activo === false ? 'eye' : 'eye-slash'}`}></i>
                           </button>
                           {!esAuxiliar && (
                             <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => {
                               pedirConfirmacion('¿Borrar reseña?', `Estás a punto de eliminar la reseña de "${o.Nombre_Usuario || 'Anónimo'}". Esta acción no se puede deshacer.`, async () => {
                                 try {
                                   await eliminarOpinionAPI(o.Id_Reseña);
                                   showToast(`🗑️ Reseña de "${o.Nombre_Usuario || 'Anónimo'}" eliminada`);
                                   cargarDatos();
                                 } catch (e) { showToast(e.message, 'error'); }
                               });
                             }}>
                               <i className="fas fa-trash"></i> Eliminar
                             </button>
                           )}
                        </div>
                     </div>
                     ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL PAQUETES */}
      {modalAbierto === 'paquete' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarPaquete}>
              <div className="modal__titulo">{elementoEditable ? 'Editar' : 'Nuevo'} <span>Paquete</span></div>
              <div className="modal__campo">
                <label>Nombre del Paquete</label>
                <input name="nombre" defaultValue={elementoEditable?.Nombre_Paquete} required />
              </div>
              <div className="modal__campo">
                <label>Precio (COP)</label>
                <input name="precio" type="number" defaultValue={elementoEditable?.Precio_Paquete} required />
              </div>
              <div className="modal__campo">
                <label>Imagen URL</label>
                <input name="imagen" defaultValue={elementoEditable?.Imagen_Paquete} placeholder="https://..." />
              </div>
              <div className="modal__campo">
                <label>Descripción</label>
                <textarea name="descripcion" defaultValue={elementoEditable?.Descripcion_Paquete} rows="4" required></textarea>
              </div>
              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button>
              </div>
           </form>
        </div>
      )}

      {/* MODAL PRODUCTOS */}
      {modalAbierto === 'producto' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarProducto}>
              <div className="modal__titulo" style={{color:'var(--cian)'}}>{elementoEditable ? 'Editar' : 'Nuevo'} <span>Producto</span></div>
              <div className="modal__campo">
                <label>Nombre del Producto</label>
                <input name="nombre" defaultValue={elementoEditable?.Nombre_Producto} required />
              </div>
              <div className="modal__campo">
                <label>Precio (COP)</label>
                <input name="precio" type="number" defaultValue={elementoEditable?.Precio_Producto} required />
              </div>
              <div className="modal__campo">
                <label>Stock Disponible</label>
                <input name="stock" type="number" min="0" defaultValue={elementoEditable?.Stock !== undefined ? elementoEditable.Stock : 0} required />
              </div>
              <div className="modal__campo">
                <label>Imagen URL</label>
                <input name="imagen" defaultValue={elementoEditable?.Imagen_Producto} placeholder="https://..." />
              </div>
              <div className="modal__campo">
                <label>Categoría</label>
                <select name="categoriaId" defaultValue={elementoEditable?.Id_Categoria} required>
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(c => (
                    <option key={c.Id_Categoria} value={c.Id_Categoria}>{c.Nombre_Categoria}</option>
                  ))}
                </select>
              </div>
              <div className="modal__campo">
                <label>Descripción</label>
                <textarea name="descripcion" defaultValue={elementoEditable?.Descripcion_Producto} rows="4" required></textarea>
              </div>
              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar" style={{background:'var(--cian)', color:'#000'}}>Guardar</button>
              </div>
           </form>
        </div>
      )}

      {/* MODAL CATEGORÍAS */}
      {modalAbierto === 'categoria' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarCategoria}>
              <div className="modal__titulo" style={{color:'#DDA0DD'}}>{elementoEditable ? 'Editar' : 'Nueva'} <span>Categoría</span></div>
              <div className="modal__campo">
                <label>Nombre de la Categoría</label>
                <input name="nombre" defaultValue={elementoEditable?.Nombre_Categoria} required />
              </div>
              <div className="modal__campo">
                <label>Descripción</label>
                <textarea name="descripcion" defaultValue={elementoEditable?.Descripcion_Categoria} rows="3" placeholder="Opcional"></textarea>
              </div>
              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar" style={{background:'#FF00FF', color:'#FFF'}}>Guardar</button>
              </div>
           </form>
        </div>
      )}

      {/* MODAL USUARIO */}
      {modalAbierto === 'usuario' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarUsuario}>
              <div className="modal__titulo">Editar <span>Usuario</span></div>
              <div className="modal__campo">
                <label>Nombre</label>
                <input name="nombre" defaultValue={elementoEditable?.Nombre} required />
              </div>
              <div className="modal__campo">
                <label>Apellidos</label>
                <input name="apellidos" defaultValue={elementoEditable?.Apellidos} />
              </div>
              <div className="modal__campo">
                <label>Teléfono / Celular</label>
                <input name="celular" defaultValue={elementoEditable?.Celular} />
              </div>
              <div className="modal__campo">
                <label>Correo Electrónico</label>
                <input name="correo" type="email" defaultValue={elementoEditable?.Correo} required />
              </div>
              <div className="modal__campo">
                <label>Nueva Contraseña <span style={{fontSize:'0.7rem', opacity:0.5}}>(dejar vacío para no cambiar)</span></label>
                <input name="contraseña" type="password" placeholder="••••••••" />
              </div>
              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button>
              </div>
           </form>
        </div>
      )}

      {/* MODAL SOLICITUD (Citas/Pedidos/Personalizados) */}
      {modalAbierto === 'solicitud' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarSolicitudEspecifica}>
              <div className="modal__titulo">Editar <span>{pestanaSolicitudes === 'paquetes' ? 'Cita' : pestanaSolicitudes === 'productos' ? 'Pedido' : 'Personalizado'}</span></div>
              
              {/* Campos para CITAS */}
              {pestanaSolicitudes === 'paquetes' && (
                <>
                  <div className="modal__campo">
                    <label>Nombre Completo</label>
                    <input name="Nombre_Completo" defaultValue={elementoEditable?.Nombre_Completo} />
                  </div>
                  <div className="modal__campo">
                    <label>Correo</label>
                    <input name="Correo" type="email" defaultValue={elementoEditable?.Correo} />
                  </div>
                  <div className="modal__campo">
                    <label>Teléfono</label>
                    <input name="Numero_Telefono" defaultValue={elementoEditable?.Numero_Telefono} />
                  </div>
                  <div className="modal__campo">
                    <label>Tipo de Evento</label>
                    <input name="Tipo_Evento" defaultValue={elementoEditable?.Tipo_Evento} />
                  </div>
                  <div className="modal__campo">
                    <label>Fecha del Evento</label>
                    <input name="Fecha_Evento" type="date" defaultValue={elementoEditable?.Fecha_Evento} />
                  </div>
                  <div className="modal__campo">
                    <label>Número de Invitados</label>
                    <input name="Numero_Invitados" type="number" defaultValue={elementoEditable?.Numero_Invitados} />
                  </div>
                  <div className="modal__campo">
                    <label>Información Adicional</label>
                    <textarea name="Informacion_Adicional" defaultValue={elementoEditable?.Informacion_Adicional} rows="3"></textarea>
                  </div>
                </>
              )}

              {/* Campos para PEDIDOS */}
              {pestanaSolicitudes === 'productos' && (
                <>
                  <div className="modal__campo">
                    <label>Dirección de Envío</label>
                    <input name="direccionEnvio" defaultValue={elementoEditable?.direccionEnvio} />
                  </div>
                  <div className="modal__campo">
                    <label>Notas</label>
                    <textarea name="notas" defaultValue={elementoEditable?.notas} rows="3"></textarea>
                  </div>
                </>
              )}

              {/* Campos para PERSONALIZADO */}
              {pestanaSolicitudes === 'personalizado' && (
                <>
                  <div className="modal__campo">
                    <label>Destinatario</label>
                    <input name="Destinatario" defaultValue={elementoEditable?.Destinatario} />
                  </div>
                  <div className="modal__campo">
                    <label>Descripción de la Idea</label>
                    <textarea name="Descripcion_Idea" defaultValue={elementoEditable?.Descripcion_Idea} rows="3"></textarea>
                  </div>
                  <div className="modal__campo">
                    <label>Elementos Esenciales</label>
                    <textarea name="Elementos_Esenciales" defaultValue={elementoEditable?.Elementos_Esenciales} rows="3"></textarea>
                  </div>
                  <div className="modal__campo">
                    <label>Prioridad</label>
                    <select name="Prioridad_Cliente" defaultValue={elementoEditable?.Prioridad_Cliente || 'normal'}>
                      <option value="baja">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div className="modal__campo">
                    <label>Comentarios Adicionales</label>
                    <textarea name="Comentarios_Adicionales" defaultValue={elementoEditable?.Comentarios_Adicionales} rows="3"></textarea>
                  </div>
                </>
              )}

              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button>
              </div>
           </form>
        </div>
      )}

      {/* MODAL OPINIÓN */}
      {modalAbierto === 'opinion' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarOpinion}>
              <div className="modal__titulo">Editar <span>Opinión</span></div>
              <div className="modal__campo">
                <label>Nombre del Usuario</label>
                <input name="nombre" defaultValue={elementoEditable?.Nombre_Usuario} required />
              </div>
              <div className="modal__campo">
                <label>Calificación (1-5)</label>
                <select name="calificacion" defaultValue={elementoEditable?.Calificacion} required>
                  <option value="5">5 ★★★★★</option>
                  <option value="4">4 ★★★★</option>
                  <option value="3">3 ★★★</option>
                  <option value="2">2 ★★</option>
                  <option value="1">1 ★</option>
                </select>
              </div>
              <div className="modal__campo">
                <label>Comentario</label>
                <textarea name="comentario" defaultValue={elementoEditable?.Comentario} rows="4" required></textarea>
              </div>
              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button>
              </div>
           </form>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast.visible && (
        <div className={`toast-notificacion toast-notificacion--${toast.tipo}`}>
           <div className="toast-notificacion__icono">
             <i className={`fas fa-${toast.tipo === 'exito' ? 'check-circle' : 'exclamation-triangle'}`}></i>
           </div>
           <div className="toast-notificacion__contenido">
             <div className="toast-notificacion__titulo">{toast.tipo === 'exito' ? 'Operación Exitosa' : 'Atención'}</div>
             <div className="toast-notificacion__detalle">{toast.mensaje}</div>
           </div>
           <button type="button" className="toast-notificacion__cerrar" onClick={() => setToast({ visible: false, mensaje: '', tipo: 'exito' })}>
             <i className="fas fa-times"></i>
           </button>
           <div className="toast-notificacion__barra-progreso"></div>
        </div>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN CUSTOM */}
      {dialogo.abierto && (
        <div className="dialogo-fondo dialogo-fondo--abierto">
          <div className={`dialogo-caja ${dialogo.variante === 'info' ? 'dialogo-caja--variante-info' : ''}`}>
             <div className={`dialogo__icono-central ${dialogo.variante === 'info' ? 'dialogo__icono-central--info' : ''}`}>
                <i className={`fas ${dialogo.variante === 'info' ? 'fa-info-circle' : 'fa-exclamation-triangle'}`}></i>
             </div>
             <div className="dialogo__titulo">{dialogo.titulo}</div>
             <p className="dialogo__mensaje">{dialogo.mensaje}</p>
             <div className="dialogo__fila-botones">
                <button type="button" className="boton-accion" onClick={() => setDialogo({ ...dialogo, abierto: false })}>Cancelar</button>
                {dialogo.opciones ? (
                  // Mostrar botones por cada opción (ej. roles)
                  dialogo.opciones.map(op => (
                    <button type="button" key={op} className="boton-accion boton-accion--editar" onClick={async () => { if (dialogo.onSelect) await dialogo.onSelect(op); else if (dialogo.onConfirm) { await dialogo.onConfirm(op); } }}>
                      {String(op).toUpperCase()}
                    </button>
                  ))
                ) : (
                  <button type="button" className={`boton-accion ${dialogo.variante === 'info' ? 'boton-accion--editar' : 'boton-accion--eliminar'}`} onClick={() => { if (dialogo.onConfirm) dialogo.onConfirm(); setDialogo({ ...dialogo, abierto: false }); }}>
                    Proceder
                  </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaAdmin;