import React, { useState, useEffect, useRef } from 'react';
import NavegacionPrincipal from '../compartidos/NavegacionPrincipal';
import BarraEntrega from '../compartidos/BarraEntrega';
import RedesSocialesFlotantes from '../compartidos/RedesSocialesFlotantes';
import { useToast } from '../compartidos/useToast';
import { useScrollReveal } from '../compartidos/useScrollReveal';
import { DATOS_GALERIA } from '../../datos/datos';

export default function PaginaGaleria() {
  const { toastMensaje, toastVisible, mostrarToast } = useToast();
  useScrollReveal();

  const [filtroGaleria, setFiltroGaleria] = useState('todos');
  const [lightboxAbierto, setLightboxAbierto] = useState(false);
  const [indiceLightbox, setIndiceLightbox] = useState(0);
  const [modalVideoAbierto, setModalVideoAbierto] = useState(false);
  const [videoActual, setVideoActual] = useState({ src: '', titulo: '', categoria: '' });
  const videoRef = useRef(null);

  const itemsLightbox = filtroGaleria === 'todos'
    ? DATOS_GALERIA.filter(i => i.type !== 'video')
    : DATOS_GALERIA.filter(i => i.category === filtroGaleria && i.type !== 'video');

  const itemsFiltrados = filtroGaleria === 'todos'
    ? DATOS_GALERIA
    : DATOS_GALERIA.filter(i => i.category === filtroGaleria);

  const categorias = ['todos', ...new Set(DATOS_GALERIA.map(i => i.category))];

  useEffect(() => {
    const onKey = (e) => {
      if (lightboxAbierto) {
        if (e.key === 'ArrowLeft') navLightbox(-1);
        if (e.key === 'ArrowRight') navLightbox(1);
        if (e.key === 'Escape') cerrarLightbox();
      }
      if (modalVideoAbierto && e.key === 'Escape') cerrarModalVideo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxAbierto, modalVideoAbierto, indiceLightbox]);

  const abrirLightbox = (idx) => { setIndiceLightbox(idx); setLightboxAbierto(true); document.body.style.overflow = 'hidden'; };
  const cerrarLightbox = () => { setLightboxAbierto(false); document.body.style.overflow = ''; };
  const navLightbox = (d) => setIndiceLightbox(prev => (prev + d + itemsLightbox.length) % itemsLightbox.length);

  const abrirModalVideo = (src, titulo, categoria) => {
    setVideoActual({ src, titulo, categoria });
    setModalVideoAbierto(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (videoRef.current) { videoRef.current.load(); videoRef.current.play().catch(() => {}); } }, 100);
  };

  const cerrarModalVideo = () => {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }
    setModalVideoAbierto(false);
    document.body.style.overflow = '';
  };

  const itemLightboxActual = itemsLightbox[indiceLightbox];

  return (
    <div>
      <BarraEntrega mostrarToast={mostrarToast} />
      <NavegacionPrincipal />

      <section className="seccion-galeria seccion-espaciado" style={{ paddingTop: '120px' }}>
        <div className="contenedor">
          <div className="encabezado-seccion animar-entrada">
            <span className="etiqueta-seccion">Trabajos</span>
            <h2 className="titulo-seccion">NUESTRA <span>GALERÍA</span></h2>
            <p className="subtitulo-seccion">Proyectos que hablan por sí solos.</p>
          </div>
          <div className="galeria-filtros">
            {categorias.map(c => (
              <button type="button" key={c} className={`boton-filtro${filtroGaleria === c ? ' active' : ''}`} onClick={() => setFiltroGaleria(c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <div className="galeria-mosaico">
            {itemsFiltrados.map((item, idx) => {
              if (item.type === 'video') return (
                <div key={idx} className="galeria-item item-video" onClick={() => abrirModalVideo(item.src, item.title, item.category)}>
                  <div className="video-miniatura-contenedor">
                    <video src={`${item.src}#t=0.5`} preload="metadata" muted playsInline></video>
                    <div className="video-boton-reproducir"><i className="fas fa-play"></i></div>
                    <div className="video-insignia"><i className="fas fa-film"></i> Video</div>
                  </div>
                  <div className="galeria-item-overlay">
                    <div className="galeria-item-categoria">{item.category}</div>
                    <div className="galeria-item-titulo">{item.title}</div>
                  </div>
                </div>
              );
              const lbIdx = itemsLightbox.indexOf(item);
              if (item.type === 'especial') return (
                <div key={idx} className="galeria-item item-especial" onClick={() => abrirLightbox(lbIdx)}>
                  <img src={item.src} alt={item.title} loading="lazy" />
                  <div className="insignia-especial"><i className="fas fa-heart"></i> Especial</div>
                  <div className="galeria-item-overlay"><div className="galeria-item-categoria">{item.category}</div><div className="galeria-item-titulo">{item.title}</div></div>
                  <div className="galeria-icono-expandir"><i className="fas fa-expand-alt"></i></div>
                </div>
              );
              return (
                <div key={idx} className="galeria-item" onClick={() => abrirLightbox(lbIdx)}>
                  <img src={item.src} alt={item.title} loading="lazy" />
                  <div className="galeria-item-overlay"><div className="galeria-item-categoria">{item.category}</div><div className="galeria-item-titulo">{item.title}</div></div>
                  <div className="galeria-icono-expandir"><i className="fas fa-expand-alt"></i></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <div className={`lightbox-fondo${lightboxAbierto ? ' open' : ''}`}>
        <button type="button" className="lightbox-boton-cerrar" onClick={cerrarLightbox}>×</button>
        <button type="button" className="lightbox-navegacion prev" onClick={() => navLightbox(-1)}>‹</button>
        {itemLightboxActual && (
          <>
            <img className="lightbox-imagen" src={itemLightboxActual.src} alt={itemLightboxActual.title} />
            {itemLightboxActual.dedicatoria ? (
              <div className={`lightbox-dedicatoria${lightboxAbierto ? ' visible' : ''}`}>
                <span className="dedicatoria-icono">♥</span>
                <p className="dedicatoria-texto">{itemLightboxActual.dedicatoria}</p>
                <div className="dedicatoria-linea"></div>
              </div>
            ) : (
              <div className="lightbox-informacion">
                {itemLightboxActual.title} · {itemLightboxActual.category} · {indiceLightbox + 1} / {itemsLightbox.length}
              </div>
            )}
          </>
        )}
        <button type="button" className="lightbox-navegacion next" onClick={() => navLightbox(1)}>›</button>
      </div>

      {/* Modal Video */}
      <div className={`modal-video-fondo${modalVideoAbierto ? ' open' : ''}`} onClick={(e) => e.target.className.includes('modal-video-fondo') && cerrarModalVideo()}>
        <div className="modal-video-caja">
          <button type="button" className="modal-video-boton-cerrar" onClick={cerrarModalVideo}>×</button>
          <video ref={videoRef} src={videoActual.src} controls playsInline preload="metadata"></video>
          <div className="modal-video-informacion">
            <div>
              <div className="modal-video-categoria">{videoActual.categoria}</div>
              <div className="modal-video-titulo">{videoActual.titulo}</div>
            </div>
          </div>
        </div>
      </div>

      <RedesSocialesFlotantes />
      <div className={`notificacion-emergente${toastVisible ? ' show' : ''}`}>
        <span className="notificacion-icono">✅</span>
        <span className="notificacion-mensaje">{toastMensaje}</span>
        <div className="notificacion-progreso"></div>
      </div>
    </div>
  );
}