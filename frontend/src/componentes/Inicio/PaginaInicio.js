import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../compartidos/useToast';
import NavegacionPrincipal from '../compartidos/NavegacionPrincipal';
import BarraEntrega from '../compartidos/BarraEntrega';
import RedesSocialesFlotantes from '../compartidos/RedesSocialesFlotantes';
import { obtenerPaquetesAPI, haySesionActiva } from '../../servicios/api';

export default function PaginaInicio() {
  const navigate = useNavigate();
  const { toastMensaje, toastVisible, mostrarToast } = useToast();
  const [paquetesAPI, setPaquetesAPI] = useState([]);

  const sesionActiva = haySesionActiva();

  // Parallax hero
  useEffect(() => {
    const onScroll = () => {
      const fondo = document.getElementById('heroFondo');
      if (fondo) fondo.style.transform = `translateY(${window.scrollY * 0.25}px)`;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cargar paquetes solo para el footer
  useEffect(() => {
    obtenerPaquetesAPI().then(res => {
      setPaquetesAPI((res || []).filter(p => p.Activo).map(p => ({ nombre: p.Nombre_Paquete || 'Sin nombre' })));
    }).catch(() => {});
  }, []);

  return (
    <div>
      <BarraEntrega mostrarToast={mostrarToast} />
      <NavegacionPrincipal />

      {/* ── HERO ── */}
      <section className="seccion-hero" id="hero" style={{ paddingTop: sesionActiva ? '100px' : '64px' }}>
        <div className="hero-fondo" id="heroFondo"></div>
        <div className="hero-degradado"></div>
        <div className="hero-viñeta"></div>
        <div className="hero-cuadricula"></div>
        <div className="hero-esquina top-left"></div>
        <div className="hero-esquina top-right"></div>
        <div className="hero-esquina bottom-left"></div>
        <div className="hero-esquina bottom-right"></div>
        <div className="hero-polaroids-flotantes">
          <div className="foto-polaroid p1"><img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&q=75" alt="Boda" /></div>
          <div className="foto-polaroid p2"><img src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=200&q=75" alt="Evento" /></div>
          <div className="foto-polaroid p3"><img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&q=75" alt="Fotografía" /></div>
          <div className="foto-polaroid p4"><img src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=200&q=75" alt="Producto" /></div>
        </div>
        <div className="hero-contenido">
          <div className="hero-subtitulo-superior"><span className="punto-animado"></span>Communicating Design Lion &nbsp;·&nbsp; Bogotá, Colombia</div>
          <h1 className="hero-titulo">
            <span className="linea-normal">Convertimos tus momentos</span>
            <span className="linea-enfasis">en recuerdos</span>
            <span className="linea-normal">que perduran toda la vida</span>
          </h1>
          <p className="hero-descripcion">No solo capturamos momentos, los convertimos en experiencias únicas con fotografía y video.</p>
          <div className="hero-botones">
            <a className="boton-primario" onClick={() => navigate('/paquetes')} style={{ cursor: 'pointer' }}>Ver Paquetes</a>
            <a className="boton-secundario" onClick={() => navigate('/galeria')} style={{ cursor: 'pointer' }}>Explorar Galería</a>
          </div>
        </div>
        <div className="hero-indicador-scroll"><span className="indicador-scroll-texto"></span><div className="indicador-scroll-barra"></div></div>
        <div className="hero-barra-estadisticas">
          <div className="estadistica-item"><div className="estadistica-numero">4K+</div><div className="estadistica-etiqueta">Calidad Visual</div></div>
          <div className="estadistica-item"><div className="estadistica-numero">100%</div><div className="estadistica-etiqueta">Diseño Personalizado</div></div>
          <div className="estadistica-item"><div className="estadistica-numero">5★</div><div className="estadistica-etiqueta">Experiencia Premium</div></div>
          <div className="estadistica-item"><div className="estadistica-numero">BOG</div><div className="estadistica-etiqueta">Bogotá, Colombia</div></div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="pie-sitio">
        <div className="contenedor">
          <div className="pie-cuadricula">
            <div>
              <a className="pie-logotipo" href="/" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                COMMUNICATING <br /> DESIGN <span>LION</span>
              </a>
              <p className="pie-descripcion">Communicating Design Lion — Fotografía y videofilmación profesional para momentos inolvidables. Bogotá, Colombia.</p>
            </div>
            <div className="pie-columna">
              <h4>Navegación</h4>
              <ul className="pie-enlaces">
                <li><Link to="/servicios">Servicios</Link></li>
                <li><Link to="/paquetes">Portafolio</Link></li>
                <li><Link to="/galeria">Galería</Link></li>
                <li><Link to="/opiniones">Opiniones</Link></li>
              </ul>
            </div>
            <div className="pie-columna">
              <h4>Paquetes</h4>
              <ul className="pie-enlaces">
                {paquetesAPI.map(p => <li key={p.nombre}><Link to="/portafolio">{p.nombre}</Link></li>)}
              </ul>
            </div>
            <div className="pie-columna">
              <h4>Contacto</h4>
              <ul className="pie-enlaces">
                <li><a href="https://wa.me/573132741001" target="_blank" rel="noreferrer">📱 +57 313 274 1001</a></li>
                <li><a href="https://www.instagram.com/communicatingdesignlion" target="_blank" rel="noreferrer">📷 Instagram</a></li>
                <li><a href="https://www.facebook.com/share/1EnQZv6zX4/" target="_blank" rel="noreferrer">👥 Facebook</a></li>
                <li><a>📍 Bogotá, Colombia</a></li>
              </ul>
            </div>
          </div>
          <div className="pie-inferior">
            <span className="pie-copyright">© 2025 Communicating Design Lion. Todos los derechos reservados.</span>
            <span className="pie-copyright" style={{ color: 'var(--red)' }}>Hecho en Colombia</span>
          </div>
        </div>
      </footer>

      <RedesSocialesFlotantes />

      <div className={`notificacion-emergente${toastVisible ? ' show' : ''}`} id="notificacionEmergente">
        <span className="notificacion-icono">✅</span>
        <span className="notificacion-mensaje">{toastMensaje}</span>
        <div className="notificacion-progreso"></div>
      </div>
    </div>
  );
}