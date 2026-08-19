import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  obtenerPerfilAPI, 
  actualizarPerfilAPI,
  obtenerDireccionesAPI, 
  obtenerMisSolicitudesAPI, 
  obtenerMisReservasAPI,
  obtenerMisPedidosAPI,
  cancelarReservaAPI,
  cancelarPedidoAPI,
  cancelarPersonalizadoAPI,
  crearDireccionAPI,
  eliminarDireccionAPI,
  editarDireccionAPI,
  cerrarSesion as logoutAPI,
  haySesionActiva,
  getUsuarioLocal
} from '../../servicios/api';
import '../../estilos/perfil.css';

const DEPARTAMENTOS = ['Amazonas','Antioquia','Arauca','Atlántico','Bogotá','Bolívar','Boyacá','Caldas','Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés y Providencia','Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'];

const ESTADOS_INFO = {
  'pendiente': { label: 'Pendiente', color: '#f59e0b' },
  'en_contacto': { label: 'En contacto contigo', color: '#3b82f6' },
  'agendada': { label: 'Agendada', color: '#a855f7' },
  'mision_cumplida': { label: '¡Misión cumplida!', color: '#22c55e' },
  'cancelada': { label: 'Cancelada', color: '#ef4444' },
  'pagado': { label: '¡Manos a la obra!', color: '#3b82f6' },
  'enviado': { label: 'Viajando hacia ti', color: '#00d9ff' },
  'entregado': { label: '¡Ya contigo!', color: '#22c55e' },
  'cancelado': { label: 'Cancelado', color: '#ef4444' },
  'en-revision': { label: 'Analizando tu idea', color: '#3b82f6' },
  'aprobado': { label: 'Creando tu idea junto a ti', color: '#a855f7' },
  'rechazado': { label: 'Dando vida a tu idea', color: '#ff0844' },
  'completado': { label: '¡Tu creación ya está contigo!', color: '#22c55e' }
};

const getEstadoInfo = (estado) => {
  return ESTADOS_INFO[estado?.toLowerCase()] || { label: estado, color: '#8484a8' };
};

const formatearCOP = (valor) => {
  if (valor === undefined || valor === null) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

export default function PaginaPerfil() {
  const navigate = useNavigate();
  const [vista, setVista] = useState('grid');
  const [usuario, setUsuario] = useState({ nombre:'', apellido:'', email:'', telefono:'', rol: 'cliente' });
  const [dirs, setDirs] = useState([]);
  const [compras] = useState({ productos:[], paquetes:[], personalizado:[] });
  const [solicitudes, setSolicitudes] = useState({ productos:[], paquetes:[], personalizado:[] });
  const [, setCargando] = useState(true);
  const [tabCompras, setTabCompras] = useState('productos');
  const [tabSolicitudes, setTabSolicitudes] = useState('productos');
  const [toast, setToast] = useState({ msg:'', visible:false, warn:false });
  const [modalEdicion, setModalEdicion] = useState(false);
  const [campoEdicion, setCampoEdicion] = useState(null);
  const [editVals, setEditVals] = useState({});
  const [modalDir, setModalDir] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({ open:false, icono:'', titulo:'', desc:'', btnLabel:'', color:'', cb:null });
  const [formDir, setFormDir] = useState({ direccion:'', departamento:'', municipio:'', barrio:'', apto:'', nombre:'', telefono:'', tipo:'residencial' });
  const [depListaAbierta, setDepListaAbierta] = useState(false);
  const [dirDetalleIdx, setDirDetalleIdx] = useState(null);
  const [modalEditDir, setModalEditDir] = useState(null);
  const [depEditAbierto, setDepEditAbierto] = useState(false);

  useEffect(() => {
    if (!haySesionActiva()) { navigate('/login'); return; }

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const results = await Promise.allSettled([
          obtenerPerfilAPI(),
          obtenerDireccionesAPI(),
          obtenerMisSolicitudesAPI(),
          obtenerMisReservasAPI(),
          obtenerMisPedidosAPI()
        ]);
        
        const [uRes, dRes, sRes, rRes, pRes] = results;
        
        const u = uRes.status === 'fulfilled' ? uRes.value : { usuario: {} };
        const d = dRes.status === 'fulfilled' ? dRes.value : [];
        const s = sRes.status === 'fulfilled' ? sRes.value : [];
        const r = rRes.status === 'fulfilled' ? rRes.value : [];
        const p = pRes.status === 'fulfilled' ? pRes.value : [];
        
        const dataUsuario = u.usuario && u.usuario.Nombre ? u.usuario : getUsuarioLocal() || {};
        const rolUsuario = String(dataUsuario.Rol?.Nombre_Rol || dataUsuario.rol || 'cliente')
          .trim()
          .toLowerCase();
        const rolNormalizado = rolUsuario === 'administrador' || rolUsuario === 'admin' ? 'admin' : rolUsuario;
        
        setUsuario({
          nombre: dataUsuario.Nombre || '',
          apellido: dataUsuario.Apellidos || '',
          email: dataUsuario.Correo || '',
          telefono: dataUsuario.Celular || '',
          rol: rolNormalizado
        });

        setDirs(d.map(item => ({
          id: item.Id_Direccion,
          direccion: item.Direccion,
          departamento: item.Departamento,
          municipio: item.Municipio_Localidad,
          barrio: item.Barrio,
          apto: item.Apart_Casa,
          nombre: item.Nombre_Completo,
          telefono: item.Telefono,
          tipo: item.Residencia_Laboral
        })));

        setSolicitudes({
          productos: p.map(ped => ({
            ...ped,
            id: `PED-${ped.id}`,
            _rawId: ped.id,
            nombre: 'Pedido de Productos',
            precio: ped.total,
            fecha: new Date(ped.createdAt).toLocaleDateString(),
            estado: ped.estado
          })),
          paquetes: r.map(res => ({
            ...res,
            id: `RES-${res.Id_Reserva_Paquete}`,
            _rawId: res.Id_Reserva_Paquete,
            nombre: res.paquete?.Nombre_Paquete || 'Paquete',
            precio: res.paquete?.Precio_Paquete || 0,
            fecha: new Date(res.Fecha_Reserva).toLocaleDateString(),
            estado: res.Estado_Reserva_Paquete
          })),
          personalizado: s.map(pers => ({
            ...pers,
            id: `PERS-${pers.Id_Personalizado}`,
            _rawId: pers.Id_Personalizado,
            nombre: 'Servicio Personalizado',
            precio: 0,
            fecha: new Date(pers.Fecha_Solicitud).toLocaleDateString(),
            estado: pers.Estado_Personalizado
          }))
        });

      } catch (error) {
        console.error('Error al cargar perfil:', error);
        if (error.message.includes('token')) logoutAPI();
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const mostrarToast = useCallback((msg, warn=false) => {
    setToast({ msg, visible:true, warn });
    setTimeout(() => setToast(p=>({...p,visible:false})), 3500);
  }, []);

  const abrirConfirm = (cfg) => setModalConfirm({ open:true, ...cfg });
  const cerrarConfirm = () => setModalConfirm(p=>({...p,open:false}));
  const ejecutarConfirm = () => { cerrarConfirm(); if (typeof modalConfirm.cb==='function') modalConfirm.cb(); };

  const irA = (s) => { 
    if (s === 'admin') { navigate('/admin'); return; }
    setVista(s); 
    window.scrollTo({top:0,behavior:'smooth'}); 
  };

  const eliminarDir = (i) => {
    const dirABorrar = dirs[i];
    abrirConfirm({ icono:'🗑️', titulo:'¿Eliminar dirección?', desc:`Se eliminará: <strong>${dirABorrar.direccion}</strong>`, btnLabel:'Sí, eliminar', color:'rojo',
      cb: async () => { 
        try {
          await eliminarDireccionAPI(dirABorrar.id);
          const nd=[...dirs]; nd.splice(i,1); setDirs(nd);
          if (dirDetalleIdx === i) setDirDetalleIdx(null);
          mostrarToast('📍 Dirección eliminada',true); 
        } catch {
          mostrarToast('❌ Error al eliminar', true);
        }
      }
    });
  };

  const abrirEditarDir = (i) => {
    const d = dirs[i];
    setModalEditDir({ idx: i, form: { ...d } });
    setDepEditAbierto(false);
  };

  const guardarEditDir = async () => {
    if (!modalEditDir) return;
    const { idx, form } = modalEditDir;
    const dirOriginal = dirs[idx];
    if (!form.direccion.trim()) { mostrarToast('⚠️ La dirección es obligatoria', true); return; }
    try {
      if (dirOriginal.id) {
        await editarDireccionAPI(dirOriginal.id, form);
      }
      const nuevas = [...dirs];
      nuevas[idx] = { ...dirOriginal, ...form };
      setDirs(nuevas);
      setModalEditDir(null);
      mostrarToast('✅ Dirección actualizada');
    } catch (e) {
      mostrarToast('❌ ' + e.message, true);
    }
  };

  const cancelarSolicitud = (id, cat) => {
    let apiCall = null;
    let numericId = '';
    let successMsg = '';

    if (cat === 'paquetes') {
      numericId = id.replace('RES-', '');
      apiCall = () => cancelarReservaAPI(numericId);
      successMsg = '✕ Solicitud cancelada';
    } else if (cat === 'productos') {
      numericId = id.replace('PED-', '');
      apiCall = () => cancelarPedidoAPI(numericId);
      successMsg = '✕ Solicitud cancelada';
    } else if (cat === 'personalizado') {
      numericId = id.replace('PERS-', '');
      apiCall = () => cancelarPersonalizadoAPI(numericId);
      successMsg = '✕ Solicitud cancelada';
    } else {
      mostrarToast('⚠️ Categoría desconocida', true);
      return;
    }

    abrirConfirm({ 
      icono: '✕', 
      titulo: '¿Cancelar solicitud?', 
      desc: '¿Estás seguro de que deseas cancelar la solicitud? Esta acción no se puede deshacer.', 
      btnLabel: 'Confirmar', 
      cancelLabel: 'Cancelar la acción', 
      color: 'rojo',
      cb: async () => {
        try {
          await apiCall();
          const s = { ...solicitudes };
          s[cat] = (s[cat]||[]).map(i => i.id === id ? { ...i, estado: 'Cancelada' } : i);
          setSolicitudes(s);
          mostrarToast(successMsg, false);
        } catch (e) {
          mostrarToast('❌ Error: ' + e.message, true);
        }
      }
    });
  };

  const CFG_EDICION = {
    email:    { titulo:'Correo electrónico', campos:[{id:'email-nuevo',label:'Nuevo correo',type:'email',ph:'nuevo@correo.com'},{id:'email-confirmar',label:'Confirmar correo',type:'email',ph:'nuevo@correo.com'}] },
    telefono: { titulo:'Teléfono',           campos:[{id:'telefono-nuevo',label:'Nuevo teléfono',type:'tel',ph:'+57 300 123 4567'}] },
    password: { titulo:'Contraseña',         campos:[{id:'pass-actual',label:'Contraseña actual',type:'password',ph:'••••••••'},{id:'pass-nueva',label:'Nueva contraseña',type:'password',ph:'Mínimo 8 caracteres'},{id:'pass-confirmar',label:'Confirmar contraseña',type:'password',ph:'Repite la contraseña'}] }
  };

  const abrirEdicion = (campo) => { setCampoEdicion(campo); setEditVals({}); setModalEdicion(true); };

  const confirmarEdicion = () => {
    if (campoEdicion === 'email') {
      if (!editVals['email-nuevo']) { mostrarToast('⚠️ Ingresa el nuevo correo', true); return; }
      if (editVals['email-nuevo'] !== editVals['email-confirmar']) { mostrarToast('⚠️ Los correos no coinciden', true); return; }
      setModalEdicion(false);
      abrirConfirm({
        icono: '✉️', titulo: '¿Cambiar correo?', desc: 'Se actualizará tu correo electrónico. ¿Confirmas?', btnLabel: 'Sí, cambiar', color: 'rojo',
        cb: async () => {
          try {
            await actualizarPerfilAPI({ correo: editVals['email-nuevo'] });
            setUsuario(prev => ({ ...prev, email: editVals['email-nuevo'] }));
            mostrarToast('✅ Correo actualizado');
          } catch (e) {
            mostrarToast(e.message, true);
          }
        }
      });
    } else if (campoEdicion === 'telefono') {
      if (!editVals['telefono-nuevo']) { mostrarToast('⚠️ Ingresa el nuevo teléfono', true); return; }
      setModalEdicion(false);
      abrirConfirm({
        icono: '📞', titulo: '¿Cambiar teléfono?', desc: 'Se actualizará el número de celular. ¿Confirmas?', btnLabel: 'Sí, cambiar', color: 'rojo',
        cb: async () => {
          try {
            await actualizarPerfilAPI({ celular: editVals['telefono-nuevo'] });
            setUsuario(prev => ({ ...prev, telefono: editVals['telefono-nuevo'] }));
            mostrarToast('✅ Teléfono actualizado');
          } catch (e) {
            mostrarToast(e.message, true);
          }
        }
      });
    } else if (campoEdicion === 'password') {
      if (!editVals['pass-actual']) { mostrarToast('⚠️ Ingresa la contraseña actual', true); return; }
      if ((editVals['pass-nueva'] || '').length < 6) { mostrarToast('⚠️ Mínimo 6 caracteres', true); return; }
      if (editVals['pass-nueva'] !== editVals['pass-confirmar']) { mostrarToast('⚠️ Las contraseñas no coinciden', true); return; }
      setModalEdicion(false);
      abrirConfirm({
        icono: '🔒', titulo: '¿Cambiar contraseña?', desc: 'Se actualizará tu clave de acceso. ¿Confirmas?', btnLabel: 'Sí, cambiar', color: 'rojo',
        cb: async () => {
          try {
            await actualizarPerfilAPI({ 
              passwordActual: editVals['pass-actual'],
              passwordNuevo: editVals['pass-nueva'] 
            });
            mostrarToast('✅ Contraseña actualizada');
          } catch (e) {
            mostrarToast(e.message, true);
          }
        }
      });
    }
  };

  const guardarDir = async () => {
    if (!formDir.direccion.trim()) { mostrarToast('⚠️ Ingresa la dirección',true); return; }
    try {
      const res = await crearDireccionAPI(formDir);
      const nueva = {
        id: res.direccion.Id_Direccion,
        ...formDir
      };
      setDirs(prev => [...prev, nueva]);
      setModalDir(false);
      setFormDir({ direccion:'', departamento:'', municipio:'', barrio:'', apto:'', nombre:'', telefono:'', tipo:'residencial' });
      mostrarToast('📍 Dirección guardada');
    } catch (e) {
      mostrarToast('❌ ' + e.message, true);
    }
  };

  const cancelarCuenta = () => {
    abrirConfirm({ icono:'⛔', titulo:'¿Eliminar tu cuenta?', desc:'Se eliminarán todos tus datos guardados. Esta acción <strong>no se puede deshacer</strong>.', btnLabel:'Sí, eliminar cuenta', color:'rojo',
      cb: () => { localStorage.clear(); mostrarToast('Cuenta cancelada...',true); setTimeout(()=>navigate('/'),2000); }
    });
  };

  const cerrarSesion = () => {
    abrirConfirm({
      icono: '🚪', titulo: '¿Cerrar sesión?', desc: '¿Estás seguro de que deseas salir de tu cuenta?', btnLabel: 'Sí, cerrar sesión', color: 'rojo',
      cb: () => {
        logoutAPI();
        navigate('/');
      }
    });
  };

  const iniciales = ((usuario.nombre||'')[0]||'').toUpperCase() + ((usuario.apellido||'')[0]||'').toUpperCase();
  const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'Usuario';

  return (
    <div className="pagina-perfil">
      <nav className="nav-barra-principal">
        <Link className="nav-logo" to="/">COMMUNICATING DESIGN <span>LION</span></Link>
        <div className="nav-controles-perfil">
          <button type="button" className="nav-btn-logout-premium" onClick={cerrarSesion}>
            <i className="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
          <Link className="nav-btn-volver-inicio" to="/"><i className="fas fa-arrow-left"></i> Volver al inicio</Link>
        </div>
      </nav>

      <div className="hero-perfil">
        <div className="hero-perfil-contenido">
          <div className="hero-avatar-iniciales">{iniciales||'?'}</div>
          <div className="hero-info-usuario">
            <h1 className="hero-nombre-usuario">{nombreCompleto}</h1>
            <p className="hero-email-usuario">{usuario.email||'—'}</p>
            <div className="hero-insignia-cliente"><i className="fas fa-crown"></i> Cliente CDL</div>
          </div>
        </div>
      </div>

      {vista==='grid' && (
        <div className="contenedor-seccion" id="vistaGridPrincipal">
          <div className="grid-tarjetas-menu">
            {[
              { id:'datos',       icono:'fa-id-card',     titulo:'Datos de tu cuenta',   desc:'Nombre, correo, teléfono y contraseña.' },
              { id:'direcciones', icono:'fa-map-marker-alt',titulo:'Direcciones',          desc:'Direcciones guardadas en tu cuenta.' },
              { id:'compras',     icono:'fa-shopping-bag', titulo:'Mis compras',           desc:'Servicios pagados y realizados.' },
              { id:'solicitudes', icono:'fa-file-alt',     titulo:'Mis solicitudes',       desc:'Solicitudes enviadas en proceso.' },
              ...((usuario.rol === 'admin' || usuario.rol === 'Administrador' || usuario.rol === 'auxiliar' || usuario.rol === 'Auxiliar' || usuario.rol === 'administrador') ? [{ id:'admin', icono:'fa-user-shield', titulo: usuario.rol === 'auxiliar' || usuario.rol === 'Auxiliar' ? 'Panel de Auxiliar' : 'Panel de Control', desc: usuario.rol === 'auxiliar' || usuario.rol === 'Auxiliar' ? 'Revisar pedidos, citas y solicitudes.' : 'Gestión de usuarios, catálogo y solicitudes.' }] : [])
            ].map(m => (
              <button 
                type="button" 
                key={m.id} 
                className="tarjeta-menu-item" 
                onClick={() => irA(m.id)}
                style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'block', width: '100%' }}
              >
                <i className={`fas ${m.icono} tarjeta-menu-icono`}></i>
                <div className="tarjeta-menu-titulo">{m.titulo}</div>
                <div className="tarjeta-menu-descripcion">{m.desc}</div>
              </button>
            ))}
          </div>
          <div className="footer-opciones-peligro">
            <p className="texto-peligro-pie">¿Deseas dejar de formar parte de CDL?</p>
            <button type="button" className="btn-eliminar-cuenta-premium" onClick={cancelarCuenta}>
              <i className="fas fa-user-times"></i> Eliminar mi cuenta permanentemente
            </button>
          </div>
        </div>
      )}

      {vista==='datos' && (
        <div className="contenedor-seccion vista-seccion slide-up">
          <button type="button" className="btn-volver-grid premium-hover" onClick={() => irA('grid')}><i className="fas fa-arrow-left"></i> Volver al panel</button>
          
          <section className="seccion-tarjeta premium-card">
            <div className="seccion-encabezado">
              <i className="fas fa-id-card seccion-encabezado-icono glow-text"></i>
              <div>
                <div className="seccion-etiqueta-categoria">— Configuración</div>
                <h2 className="seccion-titulo">Datos de tu cuenta</h2>
              </div>
            </div>

            <div className="premium-data-grid">
              <div className="premium-data-item">
                <span className="premium-data-label">Nombre</span>
                <div className="premium-data-value">{usuario.nombre||'—'}</div>
              </div>
              <div className="premium-data-item">
                <span className="premium-data-label">Apellido</span>
                <div className="premium-data-value">{usuario.apellido||'—'}</div>
              </div>
            </div>

            <div className="premium-divider"></div>

            {[
              { campo:'email',    icono:'fa-envelope', label:'Correo electrónico', valor:usuario.email||'—' },
              { campo:'telefono', icono:'fa-phone',    label:'Teléfono',           valor:usuario.telefono||'—' },
              { campo:'password', icono:'fa-lock',     label:'Contraseña',         valor: '••••••••••' },
            ].map(f => (
              <div key={f.campo} className="premium-row-editable">
                <div className="premium-row-info">
                  <span className="premium-row-label">
                    <i className={`fas ${f.icono}`}></i> {f.label}
                  </span>
                  <div className="premium-row-value">{f.valor}</div>
                </div>
                <button type="button" className="premium-btn-edit" onClick={() => abrirEdicion(f.campo)}>
                  <i className="fas fa-pen"></i> Modificar
                </button>
              </div>
            ))}
          </section>
        </div>
      )}

      {vista==='direcciones' && (
        <div className="contenedor-seccion vista-seccion slide-up">
          <button type="button" className="btn-volver-grid premium-hover" onClick={() => irA('grid')}><i className="fas fa-arrow-left"></i> Volver al panel</button>
          
          <section className="seccion-tarjeta premium-card">
            <div className="seccion-encabezado">
              <i className="fas fa-map-marker-alt seccion-encabezado-icono glow-text"></i>
              <div>
                <div className="seccion-etiqueta-categoria">— Gestionar</div>
                <h2 className="seccion-titulo">Tus direcciones</h2>
              </div>
            </div>

            <div className="premium-address-list">
              {!dirs.length ? (
                <div className="premium-empty-state">
                  <i className="fas fa-map-marked-alt"></i>
                  <p>No tienes direcciones guardadas aún.</p>
                </div>
              ) : (
                dirs.map((d, i) => (
                  <div key={d.id||i} className="premium-address-card">
                    <div className="premium-address-header">
                      <div className="premium-address-badge">
                        <i className={`fas fa-${d.tipo==='laboral'?'briefcase':'home'}`}></i>
                        {d.tipo==='laboral'?'Laboral':'Residencial'}
                      </div>
                      <button type="button" className="premium-btn-delete" onClick={() => eliminarDir(i)} title="Eliminar">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>

                    <div className="premium-address-main">
                      <div className="premium-address-line">{d.direccion}{d.apto?', '+d.apto:''}</div>
                      <div className="premium-address-sub">{d.municipio?d.municipio+' — ':''}{d.departamento}</div>
                      {d.barrio && <div className="premium-address-tag"><i className="fas fa-map-pin"></i> {d.barrio}</div>}
                    </div>

                    <div className="premium-address-footer">
                      <div className="premium-footer-item"><i className="fas fa-user"></i> {d.nombre||'—'}</div>
                      <div className="premium-footer-item"><i className="fas fa-phone"></i> {d.telefono||'—'}</div>
                    </div>

                    <div className="premium-address-actions">
                      <button type="button"
                        className="addr-btn-ver"
                        onClick={() => setDirDetalleIdx(dirDetalleIdx === i ? null : i)}
                      >
                        <i className={`fas fa-${dirDetalleIdx === i ? 'eye-slash' : 'eye'}`}></i>
                        {dirDetalleIdx === i ? 'Ocultar' : 'Ver completa'}
                      </button>
                      <button type="button"
                        className="addr-btn-editar"
                        onClick={() => abrirEditarDir(i)}
                      >
                        <i className="fas fa-pen"></i> Editar
                      </button>
                    </div>

                    {dirDetalleIdx === i && (
                      <div className="addr-detalle-panel">
                        {[
                          ['Dirección completa', d.direccion + (d.apto ? ', ' + d.apto : '')],
                          ['Barrio', d.barrio],
                          ['Municipio / Ciudad', d.municipio],
                          ['Departamento', d.departamento],
                          ['Nombre destinatario', d.nombre],
                          ['Teléfono', d.telefono],
                          ['Indicaciones', d.indicaciones],
                          ['Tipo', d.tipo]
                        ].filter(([, v]) => v).map(([k, v]) => (
                          <div key={k} className="addr-detalle-fila">
                            <span className="addr-detalle-label">{k}</span>
                            <span className="addr-detalle-valor" style={{ textTransform: k === 'Tipo' ? 'capitalize' : 'none' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="premium-actions-footer">
              <button type="button" className="premium-btn-add" onClick={() => setModalDir(true)}>
                <i className="fas fa-plus"></i> Añadir Nueva Dirección
              </button>
            </div>
          </section>
        </div>
      )}

      {vista==='compras' && (
        <div className="contenedor-seccion vista-seccion" id="vistaCompras">
          <button type="button" className="btn-volver-grid" onClick={() => irA('grid')}><i className="fas fa-arrow-left"></i> Volver</button>
          <section className="seccion-tarjeta">
            <div className="seccion-encabezado">
              <i className="fas fa-shopping-bag seccion-encabezado-icono"></i>
              <div><div className="seccion-etiqueta-categoria">— Historial</div><h2 className="seccion-titulo">Mis compras</h2></div>
            </div>
            <div className="pestanas-navegacion">
              {['productos','paquetes','personalizado'].map(cat => (
                <button type="button" key={cat} className={`pestana-btn${tabCompras===cat?' active':''}`} onClick={() => setTabCompras(cat)}>
                  {cat.charAt(0).toUpperCase()+cat.slice(1)}
                </button>
              ))}
            </div>
            {['productos','paquetes','personalizado'].map(cat => (
              <div key={cat} className={`pestana-contenido${tabCompras===cat?' active':''}`}>
                {!(compras[cat]||[]).length ? (
                  <p className="historial-mensaje-vacio">No hay registros en esta categoría.</p>
                ) : (
                  (compras[cat]||[]).map((it, i) => (
                    <div key={i} className="historial-tarjeta">
                      <div className="historial-tarjeta-encabezado">
                        <div><div className="historial-id-pedido">{it.id}</div><div className="historial-nombre-pedido">{it.nombre}</div></div>
                        <div className="historial-estado-badge" style={{ backgroundColor: getEstadoInfo(it.estado).color + '20', color: getEstadoInfo(it.estado).color, borderColor: getEstadoInfo(it.estado).color, borderWidth: 1, borderStyle: 'solid' }}>{getEstadoInfo(it.estado).label}</div>
                      </div>
                      <div className="historial-tarjeta-pie">
                        <span className="historial-precio">{it.precio}</span>
                        <span className="historial-fecha"><i className="fas fa-calendar-alt"></i> {it.fecha}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </section>
        </div>
      )}

      {vista==='solicitudes' && (
        <div className="contenedor-seccion vista-seccion" id="vistaSolicitudes">
          <button type="button" className="btn-volver-grid" onClick={() => irA('grid')}><i className="fas fa-arrow-left"></i> Volver</button>
          <section className="seccion-tarjeta">
            <div className="seccion-encabezado">
              <i className="fas fa-file-alt seccion-encabezado-icono"></i>
              <div><div className="seccion-etiqueta-categoria">— Seguimiento</div><h2 className="seccion-titulo">Mis solicitudes</h2></div>
            </div>
            <div className="pestanas-navegacion">
              {['productos','paquetes','personalizado'].map(cat => (
                <button type="button" key={cat} className={`pestana-btn${tabSolicitudes===cat?' active':''}`} onClick={() => setTabSolicitudes(cat)}>
                  {cat.charAt(0).toUpperCase()+cat.slice(1)}
                </button>
              ))}
            </div>
            {['productos','paquetes','personalizado'].map(cat => (
              <div key={cat} className={`pestana-contenido${tabSolicitudes===cat?' active':''}`}>
                {!(solicitudes[cat]||[]).length ? (
                  <p className="historial-mensaje-vacio">No hay registros en esta categoría.</p>
                ) : (
                  (solicitudes[cat]||[]).map((it, i) => (
                    <div key={i} className="historial-tarjeta" style={{borderTop: '3px solid var(--rojo)', padding:'20px', flexDirection:'column', alignItems:'stretch'}}>
                      
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'15px', width:'100%'}}>
                        <div>
                          <div style={{fontWeight:700, fontSize:'1.1rem'}}>{it.nombre}</div>
                          <div style={{fontSize:'0.7rem', opacity:0.5, marginTop:'4px'}}>
                            <i className="fas fa-clock"></i> Creado: {it.fecha}
                          </div>
                        </div>
                        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px'}}>
                          <div className="historial-estado-badge" style={{ backgroundColor: getEstadoInfo(it.estado).color + '20', color: getEstadoInfo(it.estado).color, borderColor: getEstadoInfo(it.estado).color, borderWidth: 1, borderStyle: 'solid' }}>{getEstadoInfo(it.estado).label}</div>
                          <div style={{background: 'rgba(255,8,68,0.1)', color: 'var(--rojo)', padding:'2px 6px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>
                             {it.id}
                          </div>
                        </div>
                      </div>

                      <hr style={{borderColor: 'rgba(255,255,255,0.05)', margin: '5px 0 15px 0'}} />

                      <div style={{marginBottom:'20px'}}>

                        {cat === 'paquetes' && (
                          <div className="sol-detail-wrapper">
                            <div className="sol-info-block sol-block-highlight">
                              <div className="sol-block-label">🎯 Paquete Reservado</div>
                              <div className="sol-block-title">{it.paquete?.Nombre_Paquete || 'Paquete no encontrado'}</div>
                              {it.paquete?.Descripcion_Paquete && (
                                <div className="sol-block-desc">{it.paquete.Descripcion_Paquete}</div>
                              )}
                              <div className="sol-price-tag">{formatearCOP(it.precio)}</div>
                            </div>

                            <div className="sol-grid-2">
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-star"></i></div>
                                <div>
                                  <div className="sol-field-label">Tipo de Evento</div>
                                  <div className="sol-field-value">{it.Tipo_Evento || '—'}</div>
                                </div>
                              </div>
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-calendar-day"></i></div>
                                <div>
                                  <div className="sol-field-label">Fecha del Evento</div>
                                  <div className="sol-field-value">{it.Fecha_Evento ? new Date(it.Fecha_Evento).toLocaleDateString('es-CO', {year:'numeric',month:'long',day:'numeric'}) : '—'}</div>
                                </div>
                              </div>
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-users"></i></div>
                                <div>
                                  <div className="sol-field-label">N.° de Invitados</div>
                                  <div className="sol-field-value">{it.Numero_Invitados || '—'}</div>
                                </div>
                              </div>
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-calendar-alt"></i></div>
                                <div>
                                  <div className="sol-field-label">Fecha de Reserva</div>
                                  <div className="sol-field-value">{it.fecha || '—'}</div>
                                </div>
                              </div>
                            </div>

                            <div className="sol-section-title"><i className="fas fa-address-card"></i> Datos de Contacto</div>
                            <div className="sol-grid-2">
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-user"></i></div>
                                <div>
                                  <div className="sol-field-label">Nombre Completo</div>
                                  <div className="sol-field-value">{it.Nombre_Completo || '—'}</div>
                                </div>
                              </div>
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-envelope"></i></div>
                                <div>
                                  <div className="sol-field-label">Correo</div>
                                  <div className="sol-field-value">{it.Correo || '—'}</div>
                                </div>
                              </div>
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-phone"></i></div>
                                <div>
                                  <div className="sol-field-label">Teléfono</div>
                                  <div className="sol-field-value">{it.Numero_Telefono || '—'}</div>
                                </div>
                              </div>
                            </div>

                            {it.Informacion_Adicional && (
                              <div className="sol-text-block">
                                <div className="sol-text-label"><i className="fas fa-sticky-note"></i> Información Adicional</div>
                                <p className="sol-text-body">{it.Informacion_Adicional}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {cat === 'productos' && (
                          <div className="sol-detail-wrapper">
                            <div className="sol-info-block sol-block-highlight">
                              <div className="sol-block-label">📍 Datos de Envío</div>
                              <div className="sol-grid-2" style={{marginTop:'8px'}}>
                                <div className="sol-field-card">
                                  <div className="sol-field-icon"><i className="fas fa-map-marker-alt"></i></div>
                                  <div>
                                    <div className="sol-field-label">Dirección</div>
                                    <div className="sol-field-value">{it.direccionEnvio || 'Sin dirección'}</div>
                                  </div>
                                </div>
                                <div className="sol-field-card">
                                  <div className="sol-field-icon"><i className="fas fa-phone"></i></div>
                                  <div>
                                    <div className="sol-field-label">Teléfono</div>
                                    <div className="sol-field-value">{it.telefono || '—'}</div>
                                  </div>
                                </div>
                              </div>
                              {it.notas && (
                                <div className="sol-text-block" style={{marginTop:'8px'}}>
                                  <div className="sol-text-label"><i className="fas fa-comment-alt"></i> Notas del pedido</div>
                                  <p className="sol-text-body">{it.notas}</p>
                                </div>
                              )}
                            </div>

                            <div className="sol-section-title"><i className="fas fa-shopping-cart"></i> Productos ({it.detalles ? it.detalles.length : 0})</div>
                            <div className="sol-products-list">
                              {it.detalles && it.detalles.length > 0 ? it.detalles.map(d => (
                                <div key={d.id} className="sol-product-row">
                                  <div className="sol-product-info">
                                    <div className="sol-product-name">{d.producto?.Nombre_Producto || 'Producto eliminado'}</div>
                                    <div className="sol-product-qty">Cant: {d.cantidad} × {formatearCOP(d.precioUnitario)}</div>
                                  </div>
                                  <div className="sol-product-subtotal">{formatearCOP(d.subtotal)}</div>
                                </div>
                              )) : <div className="sol-empty-products">No hay detalles disponibles.</div>}
                            </div>
                            <div className="sol-total-row">
                              <span>Total del pedido</span>
                              <span className="sol-total-amount">{formatearCOP(it.precio)}</span>
                            </div>
                          </div>
                        )}

                        {cat === 'personalizado' && (
                          <div className="sol-detail-wrapper">
                            <div className="sol-info-block sol-block-highlight">
                              <div className="sol-block-label">🎁 Para quién es</div>
                              <div className="sol-block-title">{(it.Destinatario || 'para_mi').replaceAll('_', ' ').replaceAll(/\b\w/g, c => c.toUpperCase())}</div>
                            </div>

                            <div className="sol-section-title"><i className="fas fa-address-card"></i> Datos de Contacto</div>
                            <div className="sol-grid-2">
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-user"></i></div>
                                <div>
                                  <div className="sol-field-label">Nombre Completo</div>
                                  <div className="sol-field-value">{it.Nombre_Completo || '—'}</div>
                                </div>
                              </div>
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-envelope"></i></div>
                                <div>
                                  <div className="sol-field-label">Correo</div>
                                  <div className="sol-field-value">{it.Correo || '—'}</div>
                                </div>
                              </div>
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-phone"></i></div>
                                <div>
                                  <div className="sol-field-label">Teléfono</div>
                                  <div className="sol-field-value">{it.Numero_Telefono || '—'}</div>
                                </div>
                              </div>
                              <div className="sol-field-card">
                                <div className="sol-field-icon"><i className="fas fa-exclamation-circle"></i></div>
                                <div>
                                  <div className="sol-field-label">Prioridad</div>
                                  <div className="sol-field-value">
                                    <span className={`sol-prioridad-badge sol-prioridad-${(it.Prioridad_Cliente||'normal').toLowerCase()}`}>
                                      {(it.Prioridad_Cliente || 'Normal').toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="sol-text-block">
                              <div className="sol-text-label"><i className="fas fa-lightbulb"></i> Idea Principal</div>
                              <p className="sol-text-body">{it.Descripcion_Idea || '—'}</p>
                            </div>

                            <div className="sol-text-block">
                              <div className="sol-text-label"><i className="fas fa-puzzle-piece"></i> Elementos Esenciales</div>
                              <p className="sol-text-body">{it.Elementos_Esenciales || '—'}</p>
                            </div>

                            {it.Comentarios_Adicionales && (
                              <div className="sol-text-block">
                                <div className="sol-text-label"><i className="fas fa-comment-dots"></i> Comentarios Adicionales</div>
                                <p className="sol-text-body">{it.Comentarios_Adicionales}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                         {it.estado && it.estado.toLowerCase() !== 'cancelado' && it.estado.toLowerCase() !== 'cancelada' && (
                           <button type="button" className="historial-btn-cancelar-solicitud" onClick={() => cancelarSolicitud(it.id, cat)}>✕ Cancelar solicitud</button>
                         )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </section>
        </div>
      )}

      {/* ── MODAL EDICIÓN PREMIUM ── */}
      {modalEdicion && campoEdicion && (
        <div className="modal-fondo-oscuro glass-blur" style={{display:'flex', position:'fixed', inset:0, zIndex:9999}}>
          <button 
            type="button" 
            className="modal-backdrop-btn" 
            onClick={() => setModalEdicion(false)}
            aria-label="Cerrar modal"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', background:'transparent', border:'none', cursor:'default' }}
          />
          <div className="modal-caja-edicion-premium" style={{ position:'relative', zIndex:1, margin:'auto' }}>
            <button type="button" className="modal-btn-cerrar-premium" onClick={() => setModalEdicion(false)}>×</button>
            
            <div className="modal-cabecera-premium">
              <div className="modal-accent-line"></div>
              <h2 className="modal-titulo-premium">{CFG_EDICION[campoEdicion].titulo}</h2>
              <p className="modal-subtitulo-premium">Seguridad y Personalización de Cuenta</p>
            </div>

            <div className="modal-cuerpo-premium">
              {CFG_EDICION[campoEdicion].campos.map(f => (
                <div key={f.id} className="modal-campo-premium">
                  <label htmlFor={f.id} className="modal-label-premium">{f.label}</label>
                  <div className="modal-input-premium-container">
                    <input 
                      id={f.id} 
                      type={f.type} 
                      placeholder={f.ph} 
                      className="modal-input-premium-field"
                      value={editVals[f.id]||''}
                      onChange={e => setEditVals(p=>({...p,[f.id]:e.target.value}))} 
                    />
                    <div className="modal-input-glow"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-pie-premium">
              <button type="button" className="modal-btn-premium-cancel" onClick={() => setModalEdicion(false)}>Descartar</button>
              <button type="button" className="modal-btn-premium-action" onClick={confirmarEdicion}>
                <span>Guardar Cambios</span>
                <i className="fas fa-shield-alt"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR DIRECCIÓN ── */}
      {modalEditDir && (
        <div className="modal-fondo-oscuro glass-blur" style={{display:'flex', position:'fixed', inset:0, zIndex:9999}}>
          <button 
            type="button" 
            className="modal-backdrop-btn" 
            onClick={() => setModalEditDir(null)}
            aria-label="Cerrar modal"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', background:'transparent', border:'none', cursor:'default' }}
          />
          <div className="modal-dir-caja" style={{ position:'relative', zIndex:1, margin:'auto' }}>
            <button type="button" className="modal-btn-cerrar-premium" onClick={() => setModalEditDir(null)}>×</button>

            <div className="modal-cabecera-premium">
              <div className="modal-accent-line"></div>
              <h2 className="modal-titulo-premium">Editar Dirección</h2>
              <p className="modal-subtitulo-premium">Modifica los datos de esta dirección</p>
            </div>

            <div className="modal-cuerpo-premium">
              <div className="modal-dir-grid">
                {[
                  {label:'Dirección', campo:'direccion', ph:'Ej: Carrera 71d #1-14 Sur', full:true},
                  {label:'Municipio', campo:'municipio', ph:'Tu municipio'},
                  {label:'Barrio',    campo:'barrio',    ph:'Nombre del barrio'},
                  {label:'Apto / Casa', campo:'apto',   ph:'Ej: Apto 201'},
                  {label:'Nombre de contacto', campo:'nombre', ph:'Nombre de quien recibe'},
                  {label:'Teléfono', campo:'telefono',  ph:'+57 300 000 0000'},
                  {label:'Indicaciones', campo:'indicaciones', ph:'Ej: Puerta verde, tercer piso', full:true},
                ].map(f => (
                  <div key={f.campo} className={`modal-campo-premium${f.full?' modal-dir-full':''}`}>
                    <label htmlFor={`edit-dir-${f.campo}`} className="modal-label-premium">{f.label}</label>
                    <div className="modal-input-premium-container">
                      <input
                        id={`edit-dir-${f.campo}`}
                        type="text"
                        placeholder={f.ph}
                        className="modal-input-premium-field"
                        value={modalEditDir.form[f.campo]||''}
                        onChange={e => setModalEditDir(p=>({...p, form:{...p.form,[f.campo]:e.target.value}}))}
                      />
                      <div className="modal-input-glow"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-campo-premium" style={{position:'relative'}}>
                <label htmlFor="btn-select-dep-edit" className="modal-label-premium">Departamento</label>
                <button
                  type="button"
                  id="btn-select-dep-edit"
                  className={`modal-dir-select${depEditAbierto?' open':''}`}
                  onClick={() => setDepEditAbierto(p=>!p)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer' }}
                >
                  <span style={{color: modalEditDir.form.departamento ? 'var(--text-primary)' : 'var(--text-secondary)'}}>
                    {modalEditDir.form.departamento || 'Selecciona tu departamento'}
                  </span>
                  <i className="fas fa-chevron-down modal-dir-chevron"></i>
                </button>
                {depEditAbierto && (
                  <div className="modal-dir-dropdown">
                    {DEPARTAMENTOS.map(dep => (
                      <button
                        type="button"
                        key={dep}
                        className={`modal-dir-option${modalEditDir.form.departamento===dep?' selected':''}`}
                        onClick={() => { setModalEditDir(p=>({...p, form:{...p.form,departamento:dep}})); setDepEditAbierto(false); }}
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {modalEditDir.form.departamento===dep && <i className="fas fa-check"></i>}
                        {dep}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-campo-premium">
                <span className="modal-label-premium">Tipo de domicilio</span>
                <div className="modal-dir-tipo-row">
                  {['residencial','laboral'].map(t => (
                    <label key={t} htmlFor={`edit-tipo-${t}`} className={`modal-dir-tipo-opcion${modalEditDir.form.tipo===t?' activo':''}`} style={{ cursor: 'pointer' }}>
                      <input
                        id={`edit-tipo-${t}`}
                        type="radio"
                        name="mdEditTipo"
                        value={t}
                        checked={modalEditDir.form.tipo===t}
                        onChange={() => setModalEditDir(p=>({...p, form:{...p.form,tipo:t}}))}
                        style={{display:'none'}}
                      />
                      <i className={`fas fa-${t==='residencial'?'home':'briefcase'}`}></i>
                      {t.charAt(0).toUpperCase()+t.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-pie-premium">
              <button type="button" className="modal-btn-premium-cancel" onClick={() => setModalEditDir(null)}>Cancelar</button>
              <button type="button" className="modal-btn-premium-action" onClick={guardarEditDir}>
                <span>Guardar Cambios</span>
                <i className="fas fa-check"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NUEVA DIRECCIÓN ── */}
      {modalDir && (
        <div className="modal-fondo-oscuro glass-blur" style={{display:'flex', position:'fixed', inset:0, zIndex:9999}}>
          <button 
            type="button" 
            className="modal-backdrop-btn" 
            onClick={() => setModalDir(false)}
            aria-label="Cerrar modal"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', background:'transparent', border:'none', cursor:'default' }}
          />
          <div className="modal-dir-caja" style={{ position:'relative', zIndex:1, margin:'auto' }}>
            <button type="button" className="modal-btn-cerrar-premium" onClick={() => setModalDir(false)}>×</button>

            <div className="modal-cabecera-premium">
              <div className="modal-accent-line"></div>
              <h2 className="modal-titulo-premium">Nueva Dirección</h2>
              <p className="modal-subtitulo-premium">Añade una dirección de entrega o contacto</p>
            </div>

            <div className="modal-cuerpo-premium">
              <div className="modal-dir-grid">
                {[
                  {label:'Dirección', campo:'direccion', ph:'Ej: Carrera 71d #1-14 Sur', full:true},
                  {label:'Municipio', campo:'municipio', ph:'Tu municipio'},
                  {label:'Barrio',    campo:'barrio',    ph:'Nombre del barrio'},
                  {label:'Apto / Casa', campo:'apto',   ph:'Ej: Apto 201'},
                  {label:'Nombre de contacto', campo:'nombre', ph:'Nombre de quien recibe'},
                  {label:'Teléfono', campo:'telefono',  ph:'+57 300 000 0000'},
                ].map(f => (
                  <div key={f.campo} className={`modal-campo-premium${f.full?' modal-dir-full':''}`}>
                    <label htmlFor={`nueva-dir-${f.campo}`} className="modal-label-premium">{f.label}</label>
                    <div className="modal-input-premium-container">
                      <input
                        id={`nueva-dir-${f.campo}`}
                        type="text"
                        placeholder={f.ph}
                        className="modal-input-premium-field"
                        value={formDir[f.campo]||''}
                        onChange={e => setFormDir(p=>({...p,[f.campo]:e.target.value}))}
                      />
                      <div className="modal-input-glow"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-campo-premium" style={{position:'relative'}}>
                <label htmlFor="btn-select-dep-nuevo" className="modal-label-premium">Departamento</label>
                <button
                  type="button"
                  id="btn-select-dep-nuevo"
                  className={`modal-dir-select${depListaAbierta?' open':''}`}
                  onClick={() => setDepListaAbierta(p=>!p)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer' }}
                >
                  <span style={{color: formDir.departamento ? 'var(--text-primary)' : 'var(--text-secondary)'}}>
                    {formDir.departamento || 'Selecciona tu departamento'}
                  </span>
                  <i className="fas fa-chevron-down modal-dir-chevron"></i>
                </button>
                {depListaAbierta && (
                  <div className="modal-dir-dropdown">
                    {DEPARTAMENTOS.map(dep => (
                      <button
                        type="button"
                        key={dep}
                        className={`modal-dir-option${formDir.departamento===dep?' selected':''}`}
                        onClick={() => { setFormDir(p=>({...p,departamento:dep})); setDepListaAbierta(false); }}
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {formDir.departamento===dep && <i className="fas fa-check"></i>}
                        {dep}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-campo-premium">
                <span className="modal-label-premium">Tipo de domicilio</span>
                <div className="modal-dir-tipo-row">
                  {['residencial','laboral'].map(t => (
                    <label key={t} htmlFor={`nuevo-tipo-${t}`} className={`modal-dir-tipo-opcion${formDir.tipo===t?' activo':''}`} style={{ cursor: 'pointer' }}>
                      <input
                        id={`nuevo-tipo-${t}`}
                        type="radio"
                        name="mdTipo"
                        value={t}
                        checked={formDir.tipo===t}
                        onChange={() => setFormDir(p=>({...p,tipo:t}))}
                        style={{display:'none'}}
                      />
                      <i className={`fas fa-${t==='residencial'?'home':'briefcase'}`}></i>
                      {t.charAt(0).toUpperCase()+t.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-pie-premium">
              <button type="button" className="modal-btn-premium-cancel" onClick={() => setModalDir(false)}>
                Cancelar
              </button>
              <button type="button" className="modal-btn-premium-action" onClick={guardarDir}>
                <span>Guardar dirección</span>
                <i className="fas fa-map-marker-alt"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMACIÓN ── */}
      {modalConfirm.open && (
        <div className="modal-fondo-oscuro glass-blur" style={{display:'flex', position:'fixed', inset:0, zIndex:9999}}>
          <button 
            type="button" 
            className="modal-backdrop-btn" 
            onClick={cerrarConfirm}
            aria-label="Cerrar modal"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', background:'transparent', border:'none', cursor:'default' }}
          />
          <div className="modal-caja-confirmacion confirm-box premium-card slide-up" style={{ position:'relative', zIndex:1, margin:'auto' }}>
            <div className="confirm-icon glow-text" style={{fontSize: '3rem', marginBottom: '15px'}}>{modalConfirm.icono}</div>
            <div className="modal-titulo-premium glow-text" style={{fontSize: '1.8rem', marginBottom: '10px'}}>{modalConfirm.titulo}</div>
            <div className="confirm-desc" dangerouslySetInnerHTML={{__html:modalConfirm.desc}}></div>
            <div className="confirm-btns" style={{marginTop:'25px'}}>
              <button type="button" className="confirm-btn-cancel" onClick={cerrarConfirm}>
                {modalConfirm.cancelLabel || 'Cancelar'}
              </button>
              <button type="button" className={`confirm-btn-ok ${modalConfirm.color||''}`} onClick={ejecutarConfirm}>
                {modalConfirm.btnLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div id="toastNotificacion" className={`toast-notificacion show ${toast.warn ? 'warn' : ''}`}>
          <span id="perfilToastMsg">{toast.msg}</span>
          <div className="toast-barra-progreso"></div>
        </div>
      )}
    </div>
  );
}