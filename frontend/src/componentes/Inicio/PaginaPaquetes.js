import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavegacionPrincipal from '../compartidos/NavegacionPrincipal';
import BarraEntrega from '../compartidos/BarraEntrega';
import RedesSocialesFlotantes from '../compartidos/RedesSocialesFlotantes';
import { useToast } from '../compartidos/useToast';
import { usePaquetesReveal } from '../compartidos/useScrollReveal';
import { obtenerPaquetesAPI } from '../../servicios/api';

export default function PaginaPortafolio() {
  const { toastMensaje, toastVisible, mostrarToast } = useToast();
  const navigate = useNavigate();
  const [paquetesAPI, setPaquetesAPI] = useState([]);
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [paqueteFiltro, setPaqueteFiltro] = useState('todos');

  usePaquetesReveal();

  useEffect(() => {
    obtenerPaquetesAPI().then(res => {
      const paquetesActivos = (res || []).filter(p => p.Activo == 1 || p.Activo === true || p.Activo === '1').map((p, i) => ({
        nombre: p.Nombre_Paquete || 'Sin nombre',
        precio: Number(p.Precio_Paquete) || 0,
        imagen: p.Imagen_Paquete || 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80',
        etiqueta: p.Descripcion_Paquete ? p.Descripcion_Paquete.substring(0, 40) : 'Paquete fotográfico',
        descripcion: p.Descripcion_Paquete || 'Paquete de fotografía profesional.',
        numero: String(i + 1).padStart(2, '0'),
        beneficios: (p.Descripcion_Paquete || '').split('.').filter(b => b.trim()).slice(0, 4).map(b => b.trim()),
        entrega: 'Entrega: 5 a 10 días hábiles',
        derecha: i % 2 !== 0,
        destacado: i === 2,
        idBackend: p.Id_Paquete
      }));
      setPaquetesAPI(paquetesActivos);
    }).catch(console.error);
  }, []);

  const seleccionarPaquete = (paquete) => {
    localStorage.setItem('cdl_cita_previa', JSON.stringify({ nombre: paquete.nombre, precio: paquete.precio, imagen: paquete.imagen }));
    navigate('/citas');
  };

  return (
    <div>
      <BarraEntrega mostrarToast={mostrarToast} />
      <NavegacionPrincipal />

      <section className="seccion-paquetes" style={{ paddingTop: '120px' }}>
        <div className="paquete-orbe paquete-orbe-1"></div>
        <div className="paquete-orbe paquete-orbe-2"></div>
        <div className="paquete-orbe paquete-orbe-3"></div>
        <div className="paquetes-encabezado">
          <div className="paquetes-subtitulo-superior"><span className="paquetes-punto-animado"></span>Communicating Design Lion &nbsp;·&nbsp; Portafolio</div>
          <h2 className="paquetes-titulo"><span className="texto-contorno">NUESTROS</span><br /><span>PAQUETES</span></h2>
          <p className="paquetes-descripcion">Cada paquete es una promesa de calidad, pensada para que tu recuerdo perdure para siempre.</p>
        </div>

        {/* Barra de Búsqueda y Filtro para Paquetes */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: '0 1rem' }}>
          <input 
            type="text" 
            placeholder="Buscar paquete..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-2)',
              color: 'var(--text-primary)',
              width: '100%',
              maxWidth: '300px',
              fontFamily: "'DM Sans', sans-serif"
            }}
          />
          <select 
            value={paqueteFiltro}
            onChange={(e) => setPaqueteFiltro(e.target.value)}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-2)',
              color: 'var(--text-primary)',
              width: '100%',
              maxWidth: '300px',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer'
            }}
          >
            <option value="todos">Todos los paquetes</option>
            {paquetesAPI.map(p => (
              <option key={p.idBackend} value={p.nombre}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="paquetes-linea-tiempo">
          <div className="linea-tiempo-columna"></div>
          {paquetesAPI.filter(p => {
            const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
            const coincideSelect = paqueteFiltro === 'todos' || p.nombre === paqueteFiltro;
            return coincideTexto && coincideSelect;
          }).map((p, i) => {
            const esDerecha = i % 2 !== 0;
            return (
            <div key={p.nombre} className="paquete-fila" style={esDerecha ? { flexDirection: 'row' } : {}}>
              {esDerecha && <div style={{ flex: 1, maxWidth: '80px' }}></div>}
              {esDerecha && <div className="nodo-linea-tiempo"><div className="nodo-circulo">{p.numero}</div><div className="nodo-conector"></div></div>}
              <div className={`tarjeta-paquete${p.destacado ? ' destacado' : ''}`} onClick={() => seleccionarPaquete(p)}>
                {p.destacado && <div className="insignia-destacado">Más Popular</div>}
                <div className="tarjeta-imagen">
                  <img src={p.imagen} alt={p.nombre} />
                  <div className="tarjeta-imagen-overlay"></div>
                  <div className="tarjeta-precio-insignia"><span>${p.precio.toLocaleString('es-CO')} COP</span></div>
                </div>
                <div className="tarjeta-contenido">
                  <div className="tarjeta-etiqueta">{p.etiqueta}</div>
                  <div className="tarjeta-nombre">{p.nombre.replace('Paquete ', '')}</div>
                  <p className="tarjeta-descripcion">{p.descripcion}</p>
                  <div className="tarjeta-beneficios">
                    {p.beneficios.map((b, j) => <span key={j} className="beneficio-pastilla">{b}</span>)}
                    <span className="beneficio-pastilla entrega">{p.entrega}</span>
                  </div>
                  <div className="tarjeta-pie">
                    <button type="button" className="tarjeta-boton-accion" onClick={e => { e.stopPropagation(); seleccionarPaquete(p); }}><span>Seleccionar</span></button>
                    <span className="tarjeta-flecha">→</span>
                  </div>
                </div>
              </div>
              {!esDerecha && <div className="nodo-linea-tiempo"><div className="nodo-circulo" style={p.destacado ? { borderColor: 'var(--red)', color: 'var(--red)' } : {}}>{p.numero}</div><div className="nodo-conector"></div></div>}
              {!esDerecha && <div style={{ flex: 1, maxWidth: '80px' }}></div>}
            </div>
          )})}
        </div>
        <div className="paquetes-banner">
          <div className="banner-interior">
            <div className="banner-texto">
              <h3>¿Necesitas algo diferente?</h3>
              <p>Cuéntanos tu idea y nosotros la haremos realidad.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0, alignItems: 'stretch', minWidth: '240px' }}>
              <button type="button" className="banner-boton" onClick={() => window.open('https://wa.me/573132741001', '_blank', 'noopener,noreferrer')}>Contáctanos por WhatsApp</button>
              <Link to="/personalizado" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,8,68,0.08)', border: '1px solid rgba(255,8,68,0.35)', color: '#ff0844', padding: '14px 24px', borderRadius: '50px', fontFamily: "'Rajdhani',sans-serif", fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none' }}>
                ✶ Personalizado a tu gusto
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RedesSocialesFlotantes />
      <div className={`notificacion-emergente${toastVisible ? ' show' : ''}`}>
        <span className="notificacion-icono">✅</span>
        <span className="notificacion-mensaje">{toastMensaje}</span>
        <div className="notificacion-progreso"></div>
      </div>
    </div>
  );
}