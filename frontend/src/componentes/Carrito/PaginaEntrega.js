import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerDireccionesAPI,
  crearDireccionAPI,
  eliminarDireccionAPI,
  haySesionActiva
} from '../../servicios/api';
import '../../estilos/entrega.css';
import '../../estilos/perfil.css';

const CART_KEY = 'productoCarrito';

const DEPARTAMENTOS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá', 'Bolívar', 'Boyacá',
  'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
  'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
  'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
  'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada'
];

const FORM_VACIO = {
  direccion: '', departamento: '', municipio: '', barrio: '',
  apto: '', nombre: '', telefono: '', indicaciones: '', tipo: 'residencial'
};

function obtenerCarrito() {
  try {
    const d = localStorage.getItem(CART_KEY);
    if (!d) return [];
    const p = JSON.parse(d);
    return Array.isArray(p) ? p : [p];
  } catch { return []; }
}

function formatearPrecio(p) {
  return `$${Math.round(p).toLocaleString('es-CO')}`;
}

function normalizarDir(item) {
  return {
    id:           item.Id_Direccion,
    nombre:       item.Nombre_Completo || '',
    direccion:    item.Direccion || '',
    departamento: item.Departamento || '',
    municipio:    item.Municipio_Localidad || '',
    barrio:       item.Barrio || '',
    apto:         item.Apart_Casa || '',
    telefono:     item.Telefono || '',
    indicaciones: item.Indicaciones || '',
    tipo:         item.Residencia_Laboral || 'residencial'
  };
}

function sanitizarTexto(valor) {
  if (typeof valor !== 'string') return valor;
  return valor.replaceAll('<', '&lt;').replaceAll('>', '&gt;').trim();
}

function sanitizarObjeto(obj) {
  const limpio = {};
  for (const clave in obj) {
    if (Object.hasOwn(obj, clave)) {
      limpio[clave] = sanitizarTexto(obj[clave]);
    }
  }
  return limpio;
}

export default function PaginaEntrega() {
  const navigate = useNavigate();
  const [carrito] = useState(obtenerCarrito);
  const [dirs, setDirs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(0);
  const [panelVisible, setPanelVisible] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [depAbierto, setDepAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState({ msg: '', visible: false, warn: false });

  useEffect(() => { if (!carrito.length) navigate('/carrito'); }, [carrito, navigate]);

  const mostrarToast = useCallback((msg, warn = false) => {
    setToast({ msg, visible: true, warn });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 3500);
  }, []);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      if (haySesionActiva()) {
        try {
          const data = await obtenerDireccionesAPI();
          const normalizadas = data.map(normalizarDir);
          setDirs(normalizadas);
          if (normalizadas.length > 0) {
            localStorage.setItem('cdl_direccion', JSON.stringify(normalizadas[0]));
          }
        } catch (e) {
          console.error('Error cargando dirs:', e);
          cargarDesdeStorage();
        }
      } else {
        cargarDesdeStorage();
      }
      setCargando(false);
    };

    const cargarDesdeStorage = () => {
      const lista = [];
      try {
        const r = localStorage.getItem('cdl_direccion');
        if (r) { const d = JSON.parse(r); if (d.direccion) lista.push(d); }
      } catch {}
      try {
        const r = localStorage.getItem('cdl_dirs_entrega');
        if (r) { const e = JSON.parse(r); if (Array.isArray(e)) lista.push(...e); }
      } catch {}
      setDirs(lista);
    };

    cargar();
  }, []);

  const subtotal = carrito.reduce((s, i) => s + (Number(i.precio) || Number(i.precioTotal) || 0), 0);

  const eliminarDir = async (idx) => {
    if (!window.confirm('¿Eliminar esta dirección?')) return;
    const dir = dirs[idx];
    try {
      if (dir.id && haySesionActiva()) {
        await eliminarDireccionAPI(dir.id);
      }
      const nuevas = dirs.filter((_, i) => i !== idx);
      setDirs(nuevas);
      setSeleccionado(0);
      setPanelVisible(false);
      mostrarToast('📍 Dirección eliminada');
    } catch (e) {
      mostrarToast('❌ Error al eliminar: ' + e.message, true);
    }
  };

  const guardarNueva = async () => {
    if (!form.direccion.trim()) { mostrarToast('⚠️ Ingresa la dirección', true); return; }
    setGuardando(true);
    try {
      if (haySesionActiva()) {
        const res = await crearDireccionAPI(form);
        const nueva = normalizarDir(res.direccion);
        const actualizadas = [...dirs, nueva];
        setDirs(actualizadas);
        localStorage.setItem('cdl_dirs_entrega', JSON.stringify(actualizadas));
        setSeleccionado(actualizadas.length - 1);
      } else {
        const actualizadas = [...dirs, sanitizarObjeto(form)];
        setDirs(actualizadas);
        localStorage.setItem('cdl_dirs_entrega', JSON.stringify(actualizadas.map(sanitizarObjeto)));
        setSeleccionado(actualizadas.length - 1);
      }
      setForm(FORM_VACIO);
      setMostrarForm(false);
      mostrarToast('📍 Dirección guardada');
    } catch (e) {
      mostrarToast('❌ ' + e.message, true);
    } finally {
      setGuardando(false);
    }
  };

  const continuar = () => {
    if (!dirs.length) { mostrarToast('⚠️ Agrega una dirección de entrega', true); return; }
    localStorage.setItem('cdl_entrega_seleccionada', JSON.stringify(dirs[seleccionado]));
    navigate('/carrito/pago');
  };

  const dirActual = dirs[seleccionado];

  const renderDirecciones = () => {
    if (cargando) {
      return <p className="aviso-sin-direcciones">Cargando direcciones...</p>;
    }
    if (!dirs.length) {
      return <p className="aviso-sin-direcciones">No tienes ninguna dirección guardada. Agrega una abajo.</p>;
    }
    return (
      <div id="listaDireccionesGuardadas">
        {dirs.map((dir, i) => {
          const linea1 = [dir.direccion, dir.apto].filter(Boolean).join(', ');
          const linea2 = [dir.barrio, dir.municipio, dir.departamento]
            .filter(Boolean).join(' — ') +
            (dir.nombre ? ` · ${dir.nombre}` : '') +
            (dir.telefono ? ` · ${dir.telefono}` : '');
          const esLaboral = dir.tipo === 'laboral';
          
          return (
            <button type="button"
              key={dir.id || `dir-${dir.direccion}-${i}`}
              className={`tarjeta-opcion-direccion${i === seleccionado ? ' seleccionada' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
              onClick={() => { setSeleccionado(i); setPanelVisible(false); }}
            >
              <div className="radio-seleccion-direccion"></div>
              <div style={{ flex: 1 }}>
                <div className="texto-principal-direccion">{linea1 || '—'}</div>
                {linea2 && <div className="texto-secundario-direccion">{linea2}</div>}
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    background: 'rgba(255,8,68,0.1)', color: '#ff0844',
                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px',
                    borderRadius: '20px', textTransform: 'capitalize'
                  }}>
                    <i className={`fas fa-${esLaboral ? 'briefcase' : 'home'}`} style={{ marginRight: '4px' }}></i>
                    {dir.tipo || 'Residencial'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pagina-entrega">
      {/* HEADER */}
      <header className="encabezado-pagina-entrega">
        <div className="barra-navegacion-entrega">
          <div className="logo-nombre-entrega">
            <i className="fas fa-truck"></i>
            <span>Communicating Design Lion</span>
          </div>
          <div className="indicador-pasos-compra">
            <div className="paso-proceso completado">
              <span className="circulo-numero-paso">✓</span>
              <span className="etiqueta-nombre-paso">Carrito</span>
            </div>
            <div className="linea-separadora-paso completada"></div>
            <div className="paso-proceso activo">
              <span className="circulo-numero-paso">2</span>
              <span className="etiqueta-nombre-paso">Entrega</span>
            </div>
            <div className="linea-separadora-paso"></div>
            <div className="paso-proceso">
              <span className="circulo-numero-paso">3</span>
              <span className="etiqueta-nombre-paso">Pago</span>
            </div>
          </div>
        </div>
      </header>

      <div className="zona-boton-volver">
        <button type="button" className="boton-regresar-carrito" onClick={() => navigate('/carrito')}>
          <i className="fas fa-arrow-left"></i> Volver al carrito
        </button>
      </div>

      <main className="estructura-dos-columnas-entrega">
        {/* COLUMNA IZQUIERDA */}
        <section className="columna-formulario-entrega">
          <h1 className="titulo-principal-entrega">Elige dónde recibir tus compras</h1>
          <p className="descripcion-entrega">Podrás ver costos y tiempos de entrega precisos en todo lo que busques.</p>

          <div className="bloque-seleccion-direccion">
            <h3 className="subtitulo-bloque-direccion">En una de tus direcciones</h3>

            {renderDirecciones()}

            {dirs.length > 0 && (
              <div className="grupo-botones-direccion">
                <button type="button" className="boton-accion-direccion boton-eliminar-direccion" onClick={() => eliminarDir(seleccionado)}>
                  <i className="fas fa-trash-alt"></i> Eliminar dirección
                </button>
                <button type="button" className="boton-accion-direccion boton-ver-detalle-direccion" onClick={() => setPanelVisible(p => !p)}>
                  <i className="fas fa-eye"></i> {panelVisible ? 'Ocultar' : 'Ver completa'}
                </button>
              </div>
            )}

            {panelVisible && dirActual && (
              <div className="panel-detalle-direccion" style={{ display: 'block' }}>
                <div className="contenido-detalle-direccion">
                  {[
                    ['Nombre destinatario', dirActual.nombre],
                    ['Dirección', dirActual.direccion],
                    ['Barrio', dirActual.barrio],
                    ['Municipio / Ciudad', dirActual.municipio],
                    ['Departamento', dirActual.departamento],
                    ['Apto / Casa', dirActual.apto],
                    ['Teléfono', dirActual.telefono],
                    ['Indicaciones', dirActual.indicaciones],
                    ['Tipo', dirActual.tipo]
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="fila-detalle-dir">
                      <span className="etiqueta-detalle-dir">{k}:</span>
                      <span className="valor-detalle-dir" style={{ textTransform: k === 'Tipo' ? 'capitalize' : 'none' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="button" className="boton-agregar-nueva-direccion" onClick={() => { setMostrarForm(p => !p); setDepAbierto(false); }}>
              <i className="fas fa-plus"></i> {mostrarForm ? 'Cancelar' : 'Agregar otra dirección'}
            </button>

            {/* FORMULARIO NUEVA DIRECCIÓN */}
            {mostrarForm && (
              <div className="formulario-nueva-direccion entrega-form-ampliado" style={{ display: 'block' }}>
                <h4 className="titulo-formulario-direccion">
                  <i className="fas fa-map-marker-alt" style={{ color: '#ff0844', marginRight: '8px' }}></i>
                  Nueva dirección
                </h4>

                <div className="entrega-form-grid">
                  <div className="campo-input-direccion entrega-campo-full">
                    <label htmlFor="form-direccion">Dirección <span className="req">*</span></label>
                    <input
                      id="form-direccion"
                      type="text"
                      value={form.direccion}
                      onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                      placeholder="Ej: Carrera 71d #1-14 Sur"
                    />
                  </div>

                  <div className="campo-input-direccion">
                    <label htmlFor="form-municipio">Municipio / Ciudad</label>
                    <input
                      id="form-municipio"
                      type="text"
                      value={form.municipio}
                      onChange={e => setForm(p => ({ ...p, municipio: e.target.value }))}
                      placeholder="Tu municipio"
                    />
                  </div>

                  <div className="campo-input-direccion">
                    <label htmlFor="form-barrio">Barrio</label>
                    <input
                      id="form-barrio"
                      type="text"
                      value={form.barrio}
                      onChange={e => setForm(p => ({ ...p, barrio: e.target.value }))}
                      placeholder="Nombre del barrio"
                    />
                  </div>

                  <div className="campo-input-direccion">
                    <label htmlFor="form-apto">Apto / Casa</label>
                    <input
                      id="form-apto"
                      type="text"
                      value={form.apto}
                      onChange={e => setForm(p => ({ ...p, apto: e.target.value }))}
                      placeholder="Ej: Apto 201"
                    />
                  </div>

                  <div className="campo-input-direccion">
                    <label htmlFor="form-nombre">Nombre de quien recibe</label>
                    <input
                      id="form-nombre"
                      type="text"
                      value={form.nombre}
                      onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div className="campo-input-direccion">
                    <label htmlFor="form-telefono">Teléfono de contacto</label>
                    <input
                      id="form-telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                      placeholder="+57 300 000 0000"
                    />
                  </div>

                  <div className="campo-input-direccion entrega-campo-full">
                    <label htmlFor="form-indicaciones">Indicaciones adicionales</label>
                    <input
                      id="form-indicaciones"
                      type="text"
                      value={form.indicaciones}
                      onChange={e => setForm(p => ({ ...p, indicaciones: e.target.value }))}
                      placeholder="Ej: Puerta verde, tercer piso"
                    />
                  </div>
                </div>

                <div className="campo-input-direccion" style={{ position: 'relative' }}>
                  <label htmlFor="btn-entrega-select-departamento">Departamento</label>
                  <button
                    type="button"
                    id="btn-entrega-select-departamento"
                    className={`entrega-dep-select${depAbierto ? ' open' : ''}`}
                    onClick={() => setDepAbierto(p => !p)}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: '1px solid var(--border)', cursor: 'pointer' }}
                  >
                    <span style={{ color: form.departamento ? '#eae8f2' : '#8484a8' }}>
                      {form.departamento || 'Selecciona tu departamento'}
                    </span>
                    <i className="fas fa-chevron-down entrega-dep-chevron"></i>
                  </button>
                  {depAbierto && (
                    <div className="entrega-dep-dropdown">
                      {DEPARTAMENTOS.map(dep => (
                        <button
                          type="button"
                          key={dep}
                          className={`entrega-dep-option${form.departamento === dep ? ' selected' : ''}`}
                          onClick={() => { setForm(p => ({ ...p, departamento: dep })); setDepAbierto(false); }}
                          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          {form.departamento === dep && <i className="fas fa-check" style={{ color: '#ff0844', fontSize: '0.7rem' }}></i>}
                          {dep}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="campo-input-direccion">
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Tipo de domicilio</span>
                  <div className="entrega-tipo-row">
                    {['residencial', 'laboral'].map(t => (
                      <label key={t} htmlFor={`form-tipo-${t}`} className={`entrega-tipo-opcion${form.tipo === t ? ' activo' : ''}`} style={{ cursor: 'pointer' }}>
                        <input
                          id={`form-tipo-${t}`}
                          type="radio"
                          name="entregaTipo"
                          value={t}
                          checked={form.tipo === t}
                          onChange={() => setForm(p => ({ ...p, tipo: t }))}
                          style={{ display: 'none' }}
                        />
                        <i className={`fas fa-${t === 'residencial' ? 'home' : 'briefcase'}`}></i>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="button"
                    className="boton-guardar-nueva-dir"
                    onClick={guardarNueva}
                    disabled={guardando}
                  >
                    {guardando ? (
                      <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
                    ) : (
                      <><i className="fas fa-map-marker-alt"></i> Guardar dirección</>
                    )}
                  </button>
                  <button type="button" className="boton-cancelar-nueva-dir" onClick={() => { setMostrarForm(false); setForm(FORM_VACIO); }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <button type="button" className="boton-continuar-entrega" onClick={continuar}>
            Continuar al Pago <i className="fas fa-arrow-right"></i>
          </button>
        </section>

        {/* COLUMNA DERECHA — RESUMEN */}
        <aside className="columna-resumen-entrega">
          <h2 className="titulo-resumen-entrega">Resumen del pedido</h2>
          <div id="listaItemsResumen">
            {carrito.map((item, i) => {
              const itemKey = item.id || item.Id_Producto || `item-${i}`;
              return (
                <div key={itemKey} className="fila-item-resumen">
                  <span className="nombre-item-resumen">
                    {item.nombre || item.producto?.Nombre_Producto || 'Producto'}
                  </span>
                  <span className="precio-item-resumen">
                    {formatearPrecio(Number(item.precio) || Number(item.precioTotal) || 0)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="separador-resumen"></div>
          <div className="fila-total-resumen">
            <span>Subtotal</span><span>{formatearPrecio(subtotal)}</span>
          </div>
          <div className="fila-envio-resumen">
            <span>Envío</span><span className="envio-gratis">GRATIS</span>
          </div>
          <div className="separador-resumen"></div>
          <div className="fila-gran-total">
            <span>Total</span><span>{formatearPrecio(subtotal)}</span>
          </div>
        </aside>
      </main>

      {/* TOAST */}
      {toast.visible && (
        <div className={`entrega-toast${toast.warn ? ' warn' : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}