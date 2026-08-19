import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../estilos/admin.css';
import { 
  listarUsuariosAPI, eliminarUsuarioAPI, actualizarRolAPI, editarUsuarioAPI, toggleUsuarioAPI,
  listarProductosAdminAPI, crearProductoAPI, actualizarProductoAPI, eliminarProductoAPI, toggleProductoAPI,
  obtenerPaquetesAPI, crearPaqueteAPI, actualizarPaqueteAPI, eliminarPaqueteAPI, togglePaqueteAPI,
  obtenerTodasLasSolicitudesAPI, actualizarEstadoSolicitudAPI,
  editarCitaAPI, toggleCitaAPI, eliminarCitaAPI, editarPedidoAPI, togglePedidoAPI, eliminarPedidoAPI,
  editarSolicitudAPI, toggleSolicitudAPI, eliminarSolicitudAdminAPI,
  obtenerOpinionesAPI, eliminarOpinionAPI, editarOpinionAPI, toggleOpinionAPI,
  obtenerCategoriasAPI, listarCategoriasAdminAPI, crearCategoriaAPI, actualizarCategoriaAPI, eliminarCategoriaAPI,
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
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
};

const normalizarRolWeb = (rol) => {
  if (!rol) return '';
  const valor = String(rol).trim().toLowerCase();
  if (valor === 'administrador' || valor === 'admin') return 'admin';
  if (valor === 'auxiliar') return 'auxiliar';
  return valor;
};

// --- COMPONENTES AUXILIARES DE DETALLE ---
function DetalleCita({ solicitud }) {
  return (
    <div style={{ fontSize: '0.85rem' }}>
      <div style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--rojo)', fontWeight: 700, letterSpacing: '1px', marginBottom: '5px' }}>🎯 PAQUETE SOLICITADO</div>
        <div style={{ fontWeight: 'bold' }}>{solicitud.paquete?.Nombre_Paquete || 'Paquete Eliminado'}</div>
        <div style={{ color: 'var(--rojo)' }}>{formatearCOP(solicitud.paquete?.Precio_Paquete)}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div><strong>Tipo de Evento:</strong> <br />{solicitud.Tipo_Evento || 'No especificado'}</div>
        <div><strong>Fecha del Evento:</strong> <br />{solicitud.Fecha_Evento || 'No especificada'}</div>
        <div><strong>Invitados:</strong> <br />{solicitud.Numero_Invitados || 'N/A'}</div>
      </div>
      <div>
        <strong>Información Adicional:</strong>
        <p style={{ opacity: 0.8, marginTop: '3px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>{solicitud.Informacion_Adicional || 'Sin notas adicionales.'}</p>
      </div>
    </div>
  );
}

function DetallePedidoProd({ solicitud }) {
  return (
    <div style={{ fontSize: '0.85rem' }}>
      <div style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--rojo)', fontWeight: 700, letterSpacing: '1px', marginBottom: '5px' }}>📍 DATOS DE ENVÍO</div>
        <div style={{ opacity: 0.9 }}>{solicitud.direccionEnvio || 'Sin dirección ingresada'}</div>
        {solicitud.notas && <div style={{ marginTop: '5px', color: '#ccc' }}><em>Notas: {solicitud.notas}</em></div>}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--rojo)', fontWeight: 700, letterSpacing: '1px', marginBottom: '5px' }}>🛒 PRODUCTOS ({solicitud.detalles ? solicitud.detalles.length : 0})</div>
      <div style={{ maxHeight: '120px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
        {solicitud.detalles && solicitud.detalles.length > 0 ? solicitud.detalles.map((d) => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{d.producto?.Nombre_Producto || 'Producto eliminado'}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Cant: {d.cantidad} x {formatearCOP(d.precioUnitario)}</div>
            </div>
            <div style={{ fontWeight: 'bold', color: 'var(--blanco)' }}>{formatearCOP(d.subtotal)}</div>
          </div>
        )) : <div style={{ opacity: 0.5 }}>No hay detalles.</div>}
      </div>
      <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--cian)' }}>
        TOTAL: {formatearCOP(solicitud.total)}
      </div>
    </div>
  );
}

function DetallePersonalizado({ solicitud }) {
  return (
    <div style={{ fontSize: '0.85rem' }}>
      <div style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--rojo)', fontWeight: 700, letterSpacing: '1px', marginBottom: '5px' }}>🎁 DESTINATARIO</div>
        <div style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{(solicitud.Destinatario || '').replace('_', ' ')}</div>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong><i className="fas fa-lightbulb"></i> Idea Principal:</strong>
        <p style={{ opacity: 0.8, marginTop: '3px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>{solicitud.Descripcion_Idea}</p>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <strong><i className="fas fa-puzzle-piece"></i> Elementos Esenciales:</strong>
        <p style={{ opacity: 0.8, marginTop: '3px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>{solicitud.Elementos_Esenciales}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px', marginBottom: '10px' }}>
        <div><strong>Prioridad:</strong> <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px' }}>{(solicitud.Prioridad_Cliente || 'normal').toUpperCase()}</span></div>
      </div>
      {solicitud.Comentarios_Adicionales && (
        <div>
          <strong>Comentarios:</strong>
          <p style={{ opacity: 0.8, marginTop: '3px' }}>{solicitud.Comentarios_Adicionales}</p>
        </div>
      )}
    </div>
  );
}

// --- VISTAS ESPECÍFICAS ---
function VistaUsuarios({ items, busqueda, setBusqueda, onEditar, onCambiarRol, onEliminar, onToggle, esAuxiliar, esAdminGeneral }) {
  return (
    <div>
      <div className="barra-busqueda-filtros" style={{ marginBottom: '2rem' }}>
        <div className="contenedor-campo-busqueda">
          <i className="fas fa-search"></i>
          <input className="campo-busqueda-texto" type="text" placeholder="Buscar usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>
      <div className="cuadricula-general">
        {items.map((u) => (
          <div key={u.Id_Usuario} className="tarjeta-admin">
            <div className="tarjeta-admin__barra"></div>
            <div className="tarjeta-admin__cuerpo">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div className="menu-lateral__avatar-admin" style={{ width: '40px', height: '40px' }}>{u.Nombre ? u.Nombre[0] : 'U'}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{u.Nombre} {u.Apellidos}</div>
                  <span className={`etiqueta-rol ${u.Rol?.Nombre_Rol === 'admin' ? 'etiqueta-rol--administrador' : 'etiqueta-rol--cliente'}`}>
                    {u.Rol?.Nombre_Rol || 'cliente'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{u.Correo}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{u.Celular}</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button type="button" className="boton-accion" onClick={() => onEditar(u)} title="Editar Usuario"><i className="fas fa-pen"></i></button>
              {!esAuxiliar && <button type="button" className="boton-accion boton-accion--editar" onClick={() => onCambiarRol(u.Id_Usuario, u.Rol?.Nombre_Rol)} title="Cambiar Rol"><i className="fas fa-user-shield"></i></button>}
              {esAdminGeneral && <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => onEliminar(u.Id_Usuario)} title="Eliminar Usuario"><i className="fas fa-trash"></i></button>}
              <button type="button" className={`boton-accion ${u.Activo === false ? 'boton-accion--activar' : 'boton-accion--desactivar'}`} onClick={() => onToggle(u.Id_Usuario)} title={u.Activo === false ? 'Activar Usuario' : 'Desactivar Usuario'}><i className={`fas fa-${u.Activo === false ? 'user-check' : 'user-times'}`}></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VistaPaquetes({ items, busqueda, setBusqueda, onNuevo, onEditar, onToggle, onEliminar, esAuxiliar }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="boton-accion boton-accion--guardar" onClick={onNuevo}>
          <i className="fas fa-plus"></i> Nuevo Paquete
        </button>
        <div className="contenedor-campo-busqueda">
          <i className="fas fa-search"></i>
          <input className="campo-busqueda-texto" type="text" placeholder="Buscar paquete..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>
      <div className="cuadricula-general">
        {items.map((p) => (
          <div key={p.Id_Paquete} className="tarjeta-admin">
            <div className="tarjeta-admin__barra"></div>
            <div className="tarjeta-admin__cuerpo">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>{p.Nombre_Paquete}</div>
                <span className={p.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{ fontSize: '9px' }}>{p.Activo ? 'ACTIVO' : 'OCULTO'}</span>
              </div>
              <div style={{ color: 'var(--rojo)', fontWeight: 700, margin: '5px 0' }}>{formatearCOP(p.Precio_Paquete)}</div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.Descripcion_Paquete}</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
              <button type="button" className="boton-accion" onClick={() => onEditar(p)}><i className="fas fa-pen"></i></button>
              <button type="button" className={`boton-accion ${p.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => onToggle(p.Id_Paquete)}><i className={`fas fa-${p.Activo ? 'eye-slash' : 'eye'}`}></i></button>
              {!esAuxiliar && <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => onEliminar(p.Id_Paquete)}><i className="fas fa-trash"></i></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VistaProductos({ items, busqueda, setBusqueda, onNuevo, onEditar, onToggle, onEliminar, esAuxiliar }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="boton-accion boton-accion--guardar" onClick={onNuevo}>
          <i className="fas fa-plus"></i> Nuevo Producto
        </button>
        <div className="contenedor-campo-busqueda">
          <i className="fas fa-search"></i>
          <input className="campo-busqueda-texto" type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>
      <div className="cuadricula-general">
        {items.map((p) => (
          <div key={p.Id_Producto} className="tarjeta-admin">
            <div className="tarjeta-admin__barra" style={{ background: 'linear-gradient(90deg, var(--cian), var(--rojo))' }}></div>
            <div className="tarjeta-admin__cuerpo">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>{p.Nombre_Producto}</div>
                <span className={p.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{ fontSize: '9px' }}>{p.Activo ? 'ACTIVO' : 'OCULTO'}</span>
              </div>
              <div style={{ color: 'var(--cian)', fontWeight: 700, margin: '5px 0' }}>{formatearCOP(p.Precio_Producto)}</div>
              <div style={{ fontSize: '0.8rem', color: '#ccc', margin: '8px 0' }}>Stock: <span style={{ color: '#fff' }}>{p.Stock || 0}</span></div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.Descripcion_Producto}</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
              <button type="button" className="boton-accion" onClick={() => onEditar(p)}><i className="fas fa-pen"></i></button>
              <button type="button" className={`boton-accion ${p.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => onToggle(p.Id_Producto)}><i className={`fas fa-${p.Activo ? 'eye-slash' : 'eye'}`}></i></button>
              {!esAuxiliar && <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => onEliminar(p.Id_Producto)}><i className="fas fa-trash"></i></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VistaCategorias({ items, busqueda, setBusqueda, onNuevo, onEditar, onToggle, onEliminar, esAuxiliar }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="boton-accion boton-accion--guardar" onClick={onNuevo}>
          <i className="fas fa-plus"></i> Nueva Categoría
        </button>
        <div className="contenedor-campo-busqueda">
          <i className="fas fa-search"></i>
          <input className="campo-busqueda-texto" type="text" placeholder="Buscar categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>
      <div className="cuadricula-general">
        {items.map((c) => (
          <div key={c.Id_Categoria} className="tarjeta-admin">
            <div className="tarjeta-admin__barra" style={{ background: 'linear-gradient(90deg, #8A2BE2, #FF00FF)' }}></div>
            <div className="tarjeta-admin__cuerpo">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.5rem' }}>{c.Nombre_Categoria}</div>
                <span className={p => p.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{ fontSize: '9px' }}>{c.Activo ? 'ACTIVA' : 'OCULTA'}</span>
              </div>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '10px' }}>{c.Descripcion_Categoria || 'Sin descripción'}</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
              <button type="button" className="boton-accion" onClick={() => onEditar(c)}><i className="fas fa-pen"></i></button>
              <button type="button" className={`boton-accion ${c.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => onToggle(c.Id_Categoria)}><i className={`fas fa-${c.Activo ? 'eye-slash' : 'eye'}`}></i></button>
              {!esAuxiliar && <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => onEliminar(c.Id_Categoria)}><i className="fas fa-trash"></i></button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VistaSolicitudes({ items, pestanaSolicitudes, setPestanaSolicitudes, busqueda, setBusqueda, filtroEstado, setFiltroEstado, opcionesEstado, onCambiarEstado, onEditar, onToggle, onEliminar, esAuxiliar }) {
  return (
    <div>
      <div className="barra-busqueda-filtros" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="barra-pestanas" style={{ margin: 0 }}>
          <button type="button" className={`pestana-boton ${pestanaSolicitudes === 'paquetes' ? 'pestana-boton--activa' : ''}`} onClick={() => { setPestanaSolicitudes('paquetes'); setFiltroEstado(''); }}>Citas</button>
          <button type="button" className={`pestana-boton ${pestanaSolicitudes === 'productos' ? 'pestana-boton--activa' : ''}`} onClick={() => { setPestanaSolicitudes('productos'); setFiltroEstado(''); }}>Pedidos</button>
          <button type="button" className={`pestana-boton ${pestanaSolicitudes === 'personalizado' ? 'pestana-boton--activa' : ''}`} onClick={() => { setPestanaSolicitudes('personalizado'); setFiltroEstado(''); }}>Personalizado</button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="contenedor-campo-busqueda" style={{ flex: 1 }}>
            <i className="fas fa-search"></i>
            <input className="campo-busqueda-texto" type="text" placeholder="Buscar por ID, nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <select style={{ padding: '10px', background: 'var(--bg-1)', color: '#fff', border: '1px solid var(--borde)', borderRadius: '6px' }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="" style={{ background: 'var(--bg-1)', color: '#fff' }}>Todos los estados</option>
            {opcionesEstado.map(e => <option key={e.value} value={e.value} style={{ background: 'var(--bg-1)', color: '#fff' }}>{e.label}</option>)}
          </select>
        </div>
      </div>

      <div className="cuadricula-general">
        {items.map((s) => {
          const id = s.Id_Reserva_Paquete || s.id || s.Id_Personalizado;
          const estado = s.Estado_Reserva_Paquete || s.estado || s.Estado_Personalizado;
          return (
            <div key={id} className="tarjeta-admin" style={{ borderTop: '3px solid var(--rojo)' }}>
              <div className="tarjeta-admin__cuerpo">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.Nombre_Completo || s.usuario?.Nombre || 'Cliente'}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}><i className="fas fa-envelope"></i> {s.Correo || s.usuario?.Correo || '—'}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}><i className="fas fa-phone"></i> {s.Numero_Telefono || s.telefono || s.usuario?.Celular || '—'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,8,68,0.1)', color: 'var(--rojo)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>#{id}</div>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '15px 0' }} />

                <div style={{ marginBottom: '20px' }}>
                  {pestanaSolicitudes === 'paquetes' && <DetalleCita solicitud={s} />}
                  {pestanaSolicitudes === 'productos' && <DetallePedidoProd solicitud={s} />}
                  {pestanaSolicitudes === 'personalizado' && <DetallePersonalizado solicitud={s} />}
                </div>

                <label htmlFor={`estado-solicitud-${id}`} style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '5px', color: 'var(--rojo)', display: 'block' }}>ACTUALIZAR ESTADO:</label>
                <select 
                  id={`estado-solicitud-${id}`}
                  className="selector-estado-solicitud"
                  value={estado} 
                  onChange={(e) => onCambiarEstado(id, e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-1)', color: '#fff', border: '1px solid var(--borde)', borderRadius: '6px' }}
                >
                  {opcionesEstado.map(e => <option key={e.value} value={e.value} style={{ background: 'var(--bg-1)', color: '#fff' }}>{e.label}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                  <button type="button" className="boton-accion" style={{ flex: 1 }} onClick={() => onEditar(s)}><i className="fas fa-pen"></i> Editar</button>
                  <button type="button" className={`boton-accion ${estado === 'cancelado' || estado === 'cancelada' ? 'boton-accion--activar' : 'boton-accion--eliminar'}`} style={{ flex: 1 }} onClick={() => onToggle(id)}><i className="fas fa-ban"></i> {estado === 'cancelado' || estado === 'cancelada' ? 'Restaurar' : 'Cancelar'}</button>
                  {!esAuxiliar && <button type="button" className="boton-accion boton-accion--eliminar" style={{ flex: 1 }} onClick={() => onEliminar(id)}><i className="fas fa-trash"></i> Eliminar</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VistaOpiniones({ items, busqueda, setBusqueda, filtroCalificacion, setFiltroCalificacion, onEditar, onToggle, onEliminar, esAuxiliar }) {
  return (
    <div>
      <div className="barra-busqueda-filtros" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
        <div className="contenedor-campo-busqueda" style={{ flex: 1 }}>
          <i className="fas fa-search"></i>
          <input className="campo-busqueda-texto" type="text" placeholder="Buscar por ID o nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <select style={{ padding: '10px', background: 'var(--bg-1)', color: '#fff', border: '1px solid var(--borde)', borderRadius: '6px' }} value={filtroCalificacion} onChange={(e) => setFiltroCalificacion(e.target.value)}>
          <option value="">Todas las calificaciones</option>
          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n.toString()}>{n} Estrellas</option>)}
        </select>
      </div>
      <div className="cuadricula-general">
        {items.map((o) => (
          <div key={o.Id_Reseña} className="tarjeta-admin">
            <div className="tarjeta-admin__cuerpo">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ fontWeight: 700 }}>{o.Nombre_Usuario}</div>
                <div style={{ color: 'var(--rojo)' }}>{'★'.repeat(o.Calificacion)}</div>
              </div>
              <p style={{ fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.8 }}>"{o.Comentario}"</p>
            </div>
            <div style={{ padding: '0.8rem', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '5px' }}>
              <button type="button" className="boton-accion" onClick={() => onEditar(o)}><i className="fas fa-pen"></i></button>
              <button type="button" className={`boton-accion ${o.Activo === false ? 'boton-accion--activar' : 'boton-accion--desactivar'}`} onClick={() => onToggle(o.Id_Reseña)}><i className={`fas fa-${o.Activo === false ? 'eye' : 'eye-slash'}`}></i></button>
              {!esAuxiliar && <button type="button" className="boton-accion boton-accion--eliminar" onClick={() => onEliminar(o.Id_Reseña)}><i className="fas fa-trash"></i> Eliminar</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL (Complejidad < 10) ---
const PaginaAdmin = () => {
  const navigate = useNavigate();
  const [userLocal] = useState(getUsuarioLocal());
  const rolUsuario = normalizarRolWeb(userLocal?.rol || userLocal?.Rol?.Nombre_Rol || userLocal?.Rol || '');
  const esAuxiliar = rolUsuario === 'auxiliar';
  const esAdminGeneral = rolUsuario === 'admin';
  
  const [vistaActiva, setVistaActiva] = useState('usuarios');
  const [pestanaSolicitudes, setPestanaSolicitudes] = useState('paquetes');
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'exito' });
  const [dialogo, setDialogo] = useState({ abierto: false, titulo: '', mensaje: '', onConfirm: null, variante: 'peligro' });

  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [opiniones, setOpiniones] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState('');
  const [filtroCalificacionOpinion, setFiltroCalificacionOpinion] = useState('');

  const [modalAbierto, setModalAbierto] = useState(null);
  const [elementoEditable, setElementoEditable] = useState(null);

  useEffect(() => {
    if (!userLocal || (!esAdminGeneral && !esAuxiliar)) {
      navigate('/login');
    } else if (esAuxiliar) {
      setVistaActiva('usuarios');
    }
  }, [userLocal, navigate, esAdminGeneral, esAuxiliar]);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      if (vistaActiva === 'usuarios') setUsuarios(await listarUsuariosAPI());
      else if (vistaActiva === 'productos') {
        const [resProd, resCat] = await Promise.all([listarProductosAdminAPI(), obtenerCategoriasAPI()]);
        setProductos(resProd);
        setCategorias(resCat);
      } else if (vistaActiva === 'categorias') setCategorias(await listarCategoriasAdminAPI());
      else if (vistaActiva === 'paquetes') setPaquetes(await obtenerPaquetesAPI());
      else if (vistaActiva === 'opiniones') setOpiniones(await obtenerOpinionesAPI());
      else if (vistaActiva === 'solicitudes') setSolicitudes(await obtenerTodasLasSolicitudesAPI(pestanaSolicitudes));
    } catch (error) {
      setToast({ visible: true, mensaje: error.message, tipo: 'error' });
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

  const cambiarRolUsuario = (id, rolActual) => {
    setDialogo({
      abierto: true,
      titulo: 'Seleccionar nuevo rol',
      mensaje: `Rol actual: ${String(rolActual || 'cliente').toUpperCase()}. Elige un rol:`,
      variante: 'info',
      opciones: ['admin', 'auxiliar', 'cliente'],
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
          setDialogo(prev => ({ ...prev, abierto: false }));
        }
      }
    });
  };

  const eliminarUsuario = async (id) => {
    pedirConfirmacion('¿Eliminar usuario?', 'Esta acción no se puede deshacer.', async () => {
      try {
        await eliminarUsuarioAPI(id);
        showToast('Usuario eliminado');
        cargarDatos();
      } catch (e) { showToast(e.message, 'error'); }
    });
  };

  const handleGuardarPaquete = async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target).entries());
    const payload = { nombre: datos.nombre, descripcion: datos.descripcion, precio: Number(datos.precio), imagen: datos.imagen };
    try {
      if (elementoEditable) await actualizarPaqueteAPI(elementoEditable.Id_Paquete, payload);
      else await crearPaqueteAPI(payload);
      showToast('Paquete procesado correctamente');
      setModalAbierto(null);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target).entries());
    const payload = {
      nombre: datos.nombre, descripcion: datos.descripcion, precio: Number(datos.precio),
      stock: Number(datos.stock || 0), imagen: datos.imagen, categoriaId: Number(datos.categoriaId), Activo: true
    };
    try {
      if (elementoEditable) await actualizarProductoAPI(elementoEditable.Id_Producto, payload);
      else await crearProductoAPI(payload);
      showToast('Producto procesado correctamente');
      setModalAbierto(null);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleToggleProducto = async (id) => {
    try {
      await toggleProductoAPI(id);
      showToast('Estado del producto actualizado');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarProducto = (id) => {
    pedirConfirmacion('¿Eliminar producto?', 'Esta acción no se puede deshacer.', async () => {
      try {
        await eliminarProductoAPI(id);
        showToast('Producto eliminado');
        cargarDatos();
      } catch (e) { showToast(e.message, 'error'); }
    });
  };

  const handleGuardarCategoria = async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target).entries());
    datos.Activo = true;
    try {
      if (elementoEditable) await actualizarCategoriaAPI(elementoEditable.Id_Categoria, datos);
      else await crearCategoriaAPI(datos);
      showToast('Categoría procesada correctamente');
      setModalAbierto(null);
      cargarDatos();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleCategoria = async (id) => {
    try {
      await toggleCategoriaAPI(id);
      showToast('Estado de la categoría actualizado');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarCategoria = (id) => {
    pedirConfirmacion('¿Eliminar categoría?', 'Esta acción no se puede deshacer.', async () => {
      try {
        await eliminarCategoriaAPI(id);
        showToast('Categoría eliminada');
        cargarDatos();
      } catch (e) { showToast(e.message, 'error'); }
    });
  };

  const handleTogglePaquete = async (id) => {
    try {
      await togglePaqueteAPI(id);
      showToast('Estado del paquete actualizado');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarPaquete = (id) => {
    pedirConfirmacion('¿Eliminar paquete?', 'Esta acción no se puede deshacer.', async () => {
      try {
        await eliminarPaqueteAPI(id);
        showToast('Paquete eliminado');
        cargarDatos();
      } catch (e) { showToast(e.message, 'error'); }
    });
  };

  const handleCambiarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoSolicitudAPI(pestanaSolicitudes, id, nuevoEstado);
      showToast('Estado actualizado');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleGuardarSolicitudEspecifica = async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target).entries());
    try {
      if (pestanaSolicitudes === 'paquetes') await editarCitaAPI(elementoEditable.Id_Reserva_Paquete, datos);
      else if (pestanaSolicitudes === 'productos') await editarPedidoAPI(elementoEditable.id, datos);
      else await editarSolicitudAPI(elementoEditable.Id_Personalizado, datos);
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
      showToast('Estado actualizado');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarSolicitud = (id) => {
    pedirConfirmacion('¿Eliminar solicitud?', 'Esta acción no se puede deshacer.', async () => {
      try {
        if (pestanaSolicitudes === 'paquetes') await eliminarCitaAPI(id);
        else if (pestanaSolicitudes === 'productos') await eliminarPedidoAPI(id);
        else await eliminarSolicitudAdminAPI(id);
        showToast('Solicitud eliminada');
        cargarDatos();
      } catch (e) { showToast(e.message, 'error'); }
    });
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target).entries());
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
    const datos = Object.fromEntries(new FormData(e.target).entries());
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
      showToast('Visibilidad actualizada');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const countSolicitudes = solicitudes.length;

  const dataFiltrada = () => {
    const text = busqueda.toLowerCase();
    if (vistaActiva === 'usuarios') return usuarios.filter(u => (u.Nombre || '').toLowerCase().includes(text) || (u.Correo || '').toLowerCase().includes(text));
    if (vistaActiva === 'paquetes') return paquetes.filter(p => (p.Nombre_Paquete || '').toLowerCase().includes(text));
    if (vistaActiva === 'productos') return productos.filter(p => (p.Nombre_Producto || '').toLowerCase().includes(text));
    if (vistaActiva === 'categorias') return categorias.filter(c => (c.Nombre_Categoria || '').toLowerCase().includes(text));
    if (vistaActiva === 'solicitudes') {
      return solicitudes.filter(s => {
        const id = String(s.Id_Reserva_Paquete || s.id || s.Id_Personalizado || '');
        const nom = (s.Nombre_Completo || s.usuario?.Nombre || '').toLowerCase();
        const corr = (s.Correo || s.usuario?.Correo || '').toLowerCase();
        const est = s.Estado_Reserva_Paquete || s.estado || s.Estado_Personalizado;
        return (id.includes(text) || nom.includes(text) || corr.includes(text)) && (!filtroEstadoSolicitud || est === filtroEstadoSolicitud);
      });
    }
    if (vistaActiva === 'opiniones') {
      return opiniones.filter(o => (String(o.Id_Reseña || '').includes(text) || (o.Nombre_Usuario || '').toLowerCase().includes(text)) && (!filtroCalificacionOpinion || String(o.Calificacion) === filtroCalificacionOpinion));
    }
    return [];
  };

  const itemsActuales = dataFiltrada();
  const opcionesEstado = pestanaSolicitudes === 'paquetes' ? ESTADOS_PAQUETE : pestanaSolicitudes === 'productos' ? ESTADOS_PRODUCTO : ESTADOS_PERSONAL;
  const primeraLetraAdmin = userLocal?.Nombre ? userLocal.Nombre.charAt(0) : 'A';

  return (
    <div className="pagina-admin-root">
      <aside className="menu-lateral">
        <div className="menu-lateral__contenedor-logo">
          <div className="menu-lateral__texto-logo"><span>Admin</span></div>
          <p style={{ fontSize: '0.6rem', opacity: 0.5, letterSpacing: '2px' }}>CONTROL PANEL</p>
        </div>
        <nav className="menu-lateral__navegacion">
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'usuarios' ? 'menu-lateral__enlace--activo' : ''}`} onClick={() => setVistaActiva('usuarios')}>
            <i className="fas fa-users"></i> Usuarios
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'paquetes' ? 'menu-lateral__enlace--activo' : ''}`} onClick={() => setVistaActiva('paquetes')}>
            <i className="fas fa-camera"></i> Paquetes
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'productos' ? 'menu-lateral__enlace--activo' : ''}`} onClick={() => setVistaActiva('productos')}>
            <i className="fas fa-box"></i> Productos
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'categorias' ? 'menu-lateral__enlace--activo' : ''}`} onClick={() => setVistaActiva('categorias')}>
            <i className="fas fa-tags"></i> Categorías
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'solicitudes' ? 'menu-lateral__enlace--activo' : ''}`} onClick={() => setVistaActiva('solicitudes')}>
            <i className="fas fa-envelope-open-text"></i> Solicitudes
            {countSolicitudes > 0 && <span className="menu-lateral__contador-pendientes">{countSolicitudes}</span>}
          </button>
          <button type="button" className={`menu-lateral__enlace ${vistaActiva === 'opiniones' ? 'menu-lateral__enlace--activo' : ''}`} onClick={() => setVistaActiva('opiniones')}>
            <i className="fas fa-star"></i> Opiniones
          </button>
        </nav>
        <div className="menu-lateral__pie" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button type="button" className="menu-lateral__informacion-admin" onClick={() => navigate('/')}>
            <div className="menu-lateral__avatar-admin"><i className="fas fa-home"></i></div>
            <div>
              <div className="menu-lateral__nombre-admin">Ver Página</div>
              <div className="menu-lateral__rol-admin">Ir a la tienda</div>
            </div>
          </button>
          <button type="button" className="menu-lateral__informacion-admin" onClick={() => { cerrarSesion(); navigate('/login'); }}>
            <div className="menu-lateral__avatar-admin">{primeraLetraAdmin}</div>
            <div>
              <div className="menu-lateral__nombre-admin">{esAuxiliar ? 'Auxiliar' : 'Admin'}</div>
              <div className="menu-lateral__rol-admin" style={{ color: 'var(--rojo)' }}>Cerrar Sesión</div>
            </div>
          </button>
        </div>
      </aside>

      <main className="area-contenido">
        <header className="barra-encabezado">
          <div className="barra-encabezado__titulo" style={{ textTransform: 'uppercase' }}>
            Gestión de <span>{esAuxiliar ? 'solicitudes' : vistaActiva}</span>
          </div>
          <div className="barra-encabezado__acciones">
            <div className="indicador-sistema-activo"></div>
            <span style={{ fontSize: '10px', letterSpacing: '1px' }}>ONLINE</span>
          </div>
        </header>

        <div className="contenedor-secciones">
          {cargando ? (
            <div style={{ textAlign: 'center', marginTop: '5rem' }}>
              <i className="fas fa-sync fa-spin fa-2x" style={{ color: 'var(--rojo)' }}></i>
              <p style={{ marginTop: '1rem', fontFamily: 'Rajdhani' }}>Sincronizando con base de datos...</p>
            </div>
          ) : (
            <>
              {vistaActiva === 'usuarios' && (
                <VistaUsuarios
                  items={itemsActuales}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  onEditar={(u) => { setElementoEditable(u); setModalAbierto('usuario'); }}
                  onCambiarRol={cambiarRolUsuario}
                  onEliminar={eliminarUsuario}
                  onToggle={handleToggleUsuario}
                  esAuxiliar={esAuxiliar}
                  esAdminGeneral={esAdminGeneral}
                />
              )}

              {vistaActiva === 'paquetes' && (
                <VistaPaquetes
                  items={itemsActuales}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  onNuevo={() => { setElementoEditable(null); setModalAbierto('paquete'); }}
                  onEditar={(p) => { setElementoEditable(p); setModalAbierto('paquete'); }}
                  onToggle={handleTogglePaquete}
                  onEliminar={handleEliminarPaquete}
                  esAuxiliar={esAuxiliar}
                />
              )}

              {vistaActiva === 'productos' && (
                <VistaProductos
                  items={itemsActuales}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  onNuevo={() => { setElementoEditable(null); setModalAbierto('producto'); }}
                  onEditar={(p) => { setElementoEditable(p); setModalAbierto('producto'); }}
                  onToggle={handleToggleProducto}
                  onEliminar={handleEliminarProducto}
                  esAuxiliar={esAuxiliar}
                />
              )}

              {vistaActiva === 'categorias' && (
                <VistaCategorias
                  items={itemsActuales}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  onNuevo={() => { setElementoEditable(null); setModalAbierto('categoria'); }}
                  onEditar={(c) => { setElementoEditable(c); setModalAbierto('categoria'); }}
                  onToggle={handleToggleCategoria}
                  onEliminar={handleEliminarCategoria}
                  esAuxiliar={esAuxiliar}
                />
              )}

              {vistaActiva === 'solicitudes' && (
                <VistaSolicitudes
                  items={itemsActuales}
                  pestanaSolicitudes={pestanaSolicitudes}
                  setPestanaSolicitudes={setPestanaSolicitudes}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  filtroEstado={filtroEstadoSolicitud}
                  setFiltroEstado={setFiltroEstadoSolicitud}
                  opcionesEstado={opcionesEstado}
                  onCambiarEstado={handleCambiarEstadoSolicitud}
                  onEditar={(s) => { setElementoEditable(s); setModalAbierto('solicitud'); }}
                  onToggle={handleToggleSolicitudEspecifica}
                  onEliminar={handleEliminarSolicitud}
                  esAuxiliar={esAuxiliar}
                />
              )}

              {vistaActiva === 'opiniones' && (
                <VistaOpiniones
                  items={itemsActuales}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  filtroCalificacion={filtroCalificacionOpinion}
                  setFiltroCalificacion={setFiltroCalificacionOpinion}
                  onEditar={(o) => { setElementoEditable(o); setModalAbierto('opinion'); }}
                  onToggle={handleToggleOpinion}
                  onEliminar={(id) => {
                    pedirConfirmacion('¿Borrar reseña?', 'Esta acción no se puede deshacer.', async () => {
                      try {
                        await eliminarOpinionAPI(id);
                        showToast('Reseña eliminada');
                        cargarDatos();
                      } catch (e) { showToast(e.message, 'error'); }
                    });
                  }}
                  esAuxiliar={esAuxiliar}
                />
              )}
            </>
          )}
        </div>
      </main>

      {modalAbierto === 'paquete' && (
        <div className="modal-fondo">
          <form className="modal-caja" onSubmit={handleGuardarPaquete}>
            <div className="modal__titulo">{elementoEditable ? 'Editar' : 'Nuevo'} <span>Paquete</span></div>
            <div className="modal__campo"><label htmlFor="paquete-nombre">Nombre del Paquete</label><input id="paquete-nombre" name="nombre" defaultValue={elementoEditable?.Nombre_Paquete} required /></div>
            <div className="modal__campo"><label htmlFor="paquete-precio">Precio (COP)</label><input id="paquete-precio" name="precio" type="number" defaultValue={elementoEditable?.Precio_Paquete} required /></div>
            <div className="modal__campo"><label htmlFor="paquete-imagen">Imagen URL</label><input id="paquete-imagen" name="imagen" defaultValue={elementoEditable?.Imagen_Paquete} placeholder="https://..." /></div>
            <div className="modal__campo"><label htmlFor="paquete-descripcion">Descripción</label><textarea id="paquete-descripcion" name="descripcion" defaultValue={elementoEditable?.Descripcion_Paquete} rows={4} required></textarea></div>
            <div className="modal__fila-acciones"><button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button><button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button></div>
          </form>
        </div>
      )}

      {modalAbierto === 'producto' && (
        <div className="modal-fondo">
          <form className="modal-caja" onSubmit={handleGuardarProducto}>
            <div className="modal__titulo" style={{ color: 'var(--cian)' }}>{elementoEditable ? 'Editar' : 'Nuevo'} <span>Producto</span></div>
            <div className="modal__campo"><label htmlFor="producto-nombre">Nombre del Producto</label><input id="producto-nombre" name="nombre" defaultValue={elementoEditable?.Nombre_Producto} required /></div>
            <div className="modal__campo"><label htmlFor="producto-precio">Precio (COP)</label><input id="producto-precio" name="precio" type="number" defaultValue={elementoEditable?.Precio_Producto} required /></div>
            <div className="modal__campo"><label htmlFor="producto-stock">Stock Disponible</label><input id="producto-stock" name="stock" type="number" min="0" defaultValue={elementoEditable?.Stock !== undefined ? elementoEditable.Stock : 0} required /></div>
            <div className="modal__campo"><label htmlFor="producto-imagen">Imagen URL</label><input id="producto-imagen" name="imagen" defaultValue={elementoEditable?.Imagen_Producto} placeholder="https://..." /></div>
            <div className="modal__campo"><label htmlFor="producto-categoria">Categoría</label><select id="producto-categoria" name="categoriaId" defaultValue={elementoEditable?.Id_Categoria} required><option value="">Selecciona una categoría</option>{categorias.map(c => <option key={c.Id_Categoria} value={c.Id_Categoria}>{c.Nombre_Categoria}</option>)}</select></div>
            <div className="modal__campo"><label htmlFor="producto-descripcion">Descripción</label><textarea id="producto-descripcion" name="descripcion" defaultValue={elementoEditable?.Descripcion_Producto} rows={4} required></textarea></div>
            <div className="modal__fila-acciones"><button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button><button type="submit" className="boton-accion boton-accion--guardar" style={{ background: 'var(--cian)', color: '#000' }}>Guardar</button></div>
          </form>
        </div>
      )}

      {modalAbierto === 'categoria' && (
        <div className="modal-fondo">
          <form className="modal-caja" onSubmit={handleGuardarCategoria}>
            <div className="modal__titulo" style={{ color: '#DDA0DD' }}>{elementoEditable ? 'Editar' : 'Nueva'} <span>Categoría</span></div>
            <div className="modal__campo"><label htmlFor="categoria-nombre">Nombre de la Categoría</label><input id="categoria-nombre" name="nombre" defaultValue={elementoEditable?.Nombre_Categoria} required /></div>
            <div className="modal__campo"><label htmlFor="categoria-descripcion">Descripción</label><textarea id="categoria-descripcion" name="descripcion" defaultValue={elementoEditable?.Descripcion_Categoria} rows={3} placeholder="Opcional"></textarea></div>
            <div className="modal__fila-acciones"><button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button><button type="submit" className="boton-accion boton-accion--guardar" style={{ background: '#FF00FF', color: '#FFF' }}>Guardar</button></div>
          </form>
        </div>
      )}

      {modalAbierto === 'usuario' && (
        <div className="modal-fondo">
          <form className="modal-caja" onSubmit={handleGuardarUsuario}>
            <div className="modal__titulo">Editar <span>Usuario</span></div>
            <div className="modal__campo"><label htmlFor="usuario-nombre">Nombre</label><input id="usuario-nombre" name="nombre" defaultValue={elementoEditable?.Nombre} required /></div>
            <div className="modal__campo"><label htmlFor="usuario-apellidos">Apellidos</label><input id="usuario-apellidos" name="apellidos" defaultValue={elementoEditable?.Apellidos} /></div>
            <div className="modal__campo"><label htmlFor="usuario-celular">Teléfono / Celular</label><input id="usuario-celular" name="celular" defaultValue={elementoEditable?.Celular} /></div>
            <div className="modal__campo"><label htmlFor="usuario-correo">Correo Electrónico</label><input id="usuario-correo" name="correo" type="email" defaultValue={elementoEditable?.Correo} required /></div>
            <div className="modal__campo"><label htmlFor="usuario-password">Nueva Contraseña</label><input id="usuario-password" name="contraseña" type="password" placeholder="••••••••" /></div>
            <div className="modal__fila-acciones"><button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button><button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button></div>
          </form>
        </div>
      )}

      {modalAbierto === 'solicitud' && (
        <div className="modal-fondo">
          <form className="modal-caja" onSubmit={handleGuardarSolicitudEspecifica}>
            <div className="modal__titulo">Editar <span>{pestanaSolicitudes === 'paquetes' ? 'Cita' : pestanaSolicitudes === 'productos' ? 'Pedido' : 'Personalizado'}</span></div>
            {pestanaSolicitudes === 'paquetes' && (
              <>
                <div className="modal__campo"><label htmlFor="cita-nombre-completo">Nombre Completo</label><input id="cita-nombre-completo" name="Nombre_Completo" defaultValue={elementoEditable?.Nombre_Completo} /></div>
                <div className="modal__campo"><label htmlFor="cita-correo">Correo</label><input id="cita-correo" name="Correo" type="email" defaultValue={elementoEditable?.Correo} /></div>
                <div className="modal__campo"><label htmlFor="cita-telefono">Teléfono</label><input id="cita-telefono" name="Numero_Telefono" defaultValue={elementoEditable?.Numero_Telefono} /></div>
                <div className="modal__campo"><label htmlFor="cita-tipo-evento">Tipo de Evento</label><input id="cita-tipo-evento" name="Tipo_Evento" defaultValue={elementoEditable?.Tipo_Evento} /></div>
                <div className="modal__campo"><label htmlFor="cita-fecha-evento">Fecha del Evento</label><input id="cita-fecha-evento" name="Fecha_Evento" type="date" defaultValue={elementoEditable?.Fecha_Evento} /></div>
                <div className="modal__campo"><label htmlFor="cita-invitados">Número de Invitados</label><input id="cita-invitados" name="Numero_Invitados" type="number" defaultValue={elementoEditable?.Numero_Invitados} /></div>
                <div className="modal__campo"><label htmlFor="cita-info-adicional">Información Adicional</label><textarea id="cita-info-adicional" name="Informacion_Adicional" defaultValue={elementoEditable?.Informacion_Adicional} rows={3}></textarea></div>
              </>
            )}
            {pestanaSolicitudes === 'productos' && (
              <>
                <div className="modal__campo"><label htmlFor="pedido-direccion-envio">Dirección de Envío</label><input id="pedido-direccion-envio" name="direccionEnvio" defaultValue={elementoEditable?.direccionEnvio} /></div>
                <div className="modal__campo"><label htmlFor="pedido-notas">Notas</label><textarea id="pedido-notas" name="notas" defaultValue={elementoEditable?.notas} rows={3}></textarea></div>
              </>
            )}
            {pestanaSolicitudes === 'personalizado' && (
              <>
                <div className="modal__campo"><label htmlFor="personalizado-destinatario">Destinatario</label><input id="personalizado-destinatario" name="Destinatario" defaultValue={elementoEditable?.Destinatario} /></div>
                <div className="modal__campo"><label htmlFor="personalizado-descripcion-idea">Descripción de la Idea</label><textarea id="personalizado-descripcion-idea" name="Descripcion_Idea" defaultValue={elementoEditable?.Descripcion_Idea} rows={3}></textarea></div>
                <div className="modal__campo"><label htmlFor="personalizado-elementos-esenciales">Elementos Esenciales</label><textarea id="personalizado-elementos-esenciales" name="Elementos_Esenciales" defaultValue={elementoEditable?.Elementos_Esenciales} rows={3}></textarea></div>
                <div className="modal__campo"><label htmlFor="personalizado-prioridad">Prioridad</label><select id="personalizado-prioridad" name="Prioridad_Cliente" defaultValue={elementoEditable?.Prioridad_Cliente || 'normal'}><option value="baja">Baja</option><option value="normal">Normal</option><option value="alta">Alta</option></select></div>
                <div className="modal__campo"><label htmlFor="personalizado-comentarios">Comentarios Adicionales</label><textarea id="personalizado-comentarios" name="Comentarios_Adicionales" defaultValue={elementoEditable?.Comentarios_Adicionales} rows={3}></textarea></div>
              </>
            )}
            <div className="modal__fila-acciones"><button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button><button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button></div>
          </form>
        </div>
      )}

      {modalAbierto === 'opinion' && (
        <div className="modal-fondo">
          <form className="modal-caja" onSubmit={handleGuardarOpinion}>
            <div className="modal__titulo">Editar <span>Opinión</span></div>
            <div className="modal__campo"><label htmlFor="opinion-nombre-usuario">Nombre del Usuario</label><input id="opinion-nombre-usuario" name="nombre" defaultValue={elementoEditable?.Nombre_Usuario} required /></div>
            <div className="modal__campo"><label htmlFor="opinion-calificacion">Calificación (1-5)</label><select id="opinion-calificacion" name="calificacion" defaultValue={elementoEditable?.Calificacion} required><option value="5">5 ★★★★★</option><option value="4">4 ★★★★</option><option value="3">3 ★★★</option><option value="2">2 ★★</option><option value="1">1 ★</option></select></div>
            <div className="modal__campo"><label htmlFor="opinion-comentario">Comentario</label><textarea id="opinion-comentario" name="comentario" defaultValue={elementoEditable?.Comentario} rows={4} required></textarea></div>
            <div className="modal__fila-acciones"><button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button><button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button></div>
          </form>
        </div>
      )}

      {toast.visible && (
        <div className={`toast-notificacion toast-notificacion--${toast.tipo}`}>
          <div className="toast-notificacion__icono"><i className={`fas fa-${toast.tipo === 'exito' ? 'check-circle' : 'exclamation-triangle'}`}></i></div>
          <div className="toast-notificacion__contenido">
            <div className="toast-notificacion__titulo">{toast.tipo === 'exito' ? 'Operación Exitosa' : 'Atención'}</div>
            <div className="toast-notificacion__detalle">{toast.mensaje}</div>
          </div>
          <button type="button" className="toast-notificacion__cerrar" onClick={() => setToast({ visible: false, mensaje: '', tipo: 'exito' })}><i className="fas fa-times"></i></button>
          <div className="toast-notificacion__barra-progreso"></div>
        </div>
      )}

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
                dialogo.opciones.map((op) => (
                  <button type="button" key={op} className="boton-accion boton-accion--editar" onClick={async () => { if (dialogo.onSelect) await dialogo.onSelect(op); else if (dialogo.onConfirm) await dialogo.onConfirm(op); }}>
                    {op.toUpperCase()}
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