import React from 'react';
import NavegacionPrincipal from '../compartidos/NavegacionPrincipal';
import BarraEntrega from '../compartidos/BarraEntrega';
import RedesSocialesFlotantes from '../compartidos/RedesSocialesFlotantes';
import { useToast } from '../compartidos/useToast';
import { useScrollReveal } from '../compartidos/useScrollReveal';

export default function PaginaServicios() {
  const { toastMensaje, toastVisible, mostrarToast } = useToast();
  useScrollReveal();

  return (
    <div>
      <BarraEntrega mostrarToast={mostrarToast} />
      <NavegacionPrincipal />

      <section className="seccion-servicios" style={{ paddingTop: '120px' }}>
        <div className="servicios-encabezado animar-entrada">
          <h2>Nuestros Servicios</h2>
          <p>No es solo una imagen o una foto, sino un recuerdo que te permite revivir ese momento especial una y otra vez.</p>
        </div>
        <div className="servicios-cuadricula">
          {[
            { icono: 'fa-camera', titulo: 'Tecnología de Última Generación', desc: 'Servicios de alta calidad especializados en capturar los momentos más importantes con equipos de última tecnología.', items: ['Drones especializados de captura cinematográfica', 'Cámaras UHD de fotografía y grabación', 'Cámaras Phantom para cámara lenta', 'Iluminación específica para cada captura', 'Bases giratorias para tomas dinámicas'] },
            { icono: 'fa-video', titulo: 'Edición de Video Avanzada', desc: 'Edición con efectos tridimensionales y cinematográficos, creando una experiencia visual única y de alto impacto.', items: ['Adobe After Effects y 3DS Max Studio', 'Efectos especiales de última generación', 'Estilo visual cinematográfico', 'Múltiples resoluciones y calidades', 'Resultados poligonales de alto impacto'], delay: '0.1s' },
            { icono: 'fa-box-open', titulo: 'Contenedores Temáticos', desc: 'Contenedores personalizados diseñados con gran detalle para crear un elemento único que exhibirás con orgullo.', items: ['Diseño según temática del evento', 'Materiales de alta calidad y texturización real', 'Experiencia interactiva al abrir', 'Exposición en forma de diorama', 'Opción a incluir figura de crochet'], delay: '0.2s' },
          ].map((s, i) => (
            <div key={i} className="tarjeta-servicio animar-entrada" style={s.delay ? { transitionDelay: s.delay } : {}}>
              <i className={`fas ${s.icono} servicio-icono`}></i>
              <div className="tarjeta-servicio-titulo">{s.titulo}</div>
              <p className="tarjeta-servicio-descripcion">{s.desc}</p>
              <ul className="servicio-caracteristicas">
                {s.items.map((it, j) => <li key={j}><i className="fas fa-check"></i> {it}</li>)}
              </ul>
            </div>
          ))}
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