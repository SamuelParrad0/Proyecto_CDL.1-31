import React, { useState, useEffect } from 'react';
import NavegacionPrincipal from '../compartidos/NavegacionPrincipal';
import BarraEntrega from '../compartidos/BarraEntrega';
import RedesSocialesFlotantes from '../compartidos/RedesSocialesFlotantes';
import { useToast } from '../compartidos/useToast';
import { useScrollReveal } from '../compartidos/useScrollReveal';
import { DATOS_RESEÑAS_INICIALES } from '../../datos/datos';
import { obtenerOpinionesAPI, crearOpinionAPI } from '../../servicios/api';

export default function PaginaOpiniones() {
  const { toastMensaje, toastVisible, mostrarToast } = useToast();
  useScrollReveal();

  const [reseñas, setReseñas] = useState(DATOS_RESEÑAS_INICIALES);
  const [mostrarNombre, setMostrarNombre] = useState(true);
  const [formReseña, setFormReseña] = useState({ nombre: '', calificacion: '', texto: '' });
  const [contadorTexto, setContadorTexto] = useState(0);

  useEffect(() => {
    obtenerOpinionesAPI().then(res => {
      if (res && res.length > 0) {
        setReseñas(res.map(o => ({
          nombre: o.Nombre_Usuario || 'Anónimo',
          iniciales: (o.Nombre_Usuario || 'Anónimo').split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2) || '👤',
          estrellas: o.Calificacion || 5,
          texto: o.Comentario || '',
          fecha: new Date(o.Fecha).toLocaleDateString(),
          color: ['#ff0844', '#800020']
        })));
      }
    }).catch(() => {});
  }, []);

  const enviarReseña = async () => {
    if (!formReseña.calificacion) { mostrarToast('⚠️ Selecciona una calificación'); return; }
    if (!formReseña.texto.trim()) { mostrarToast('⚠️ Escribe tu opinión'); return; }
    const nombreUsuario = mostrarNombre ? (formReseña.nombre.trim() || 'Anónimo') : 'Anónimo';
    try {
      await crearOpinionAPI({ nombre: nombreUsuario, calificacion: parseInt(formReseña.calificacion), comentario: formReseña.texto.trim() });
      const iniciales = nombreUsuario === 'Anónimo' ? '👤' : nombreUsuario.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
      setReseñas(prev => [{ nombre: nombreUsuario, iniciales, estrellas: parseInt(formReseña.calificacion), texto: formReseña.texto.trim(), fecha: 'Ahora mismo', color: ['#ff0844', '#800020'] }, ...prev]);
      mostrarToast('⭐ ¡Opinión publicada con éxito!');
      setFormReseña({ nombre: '', calificacion: '', texto: '' });
      setContadorTexto(0);
    } catch { mostrarToast('⚠️ Error al publicar opinión'); }
  };

  return (
    <div>
      <BarraEntrega mostrarToast={mostrarToast} />
      <NavegacionPrincipal />

      <section className="seccion-reseñas seccion-espaciado" style={{ paddingTop: '120px' }}>
        <div className="contenedor">
          <div className="encabezado-seccion animar-entrada">
            <span className="etiqueta-seccion">Opiniones</span>
            <h2 className="titulo-seccion">LO QUE DICEN <span>NUESTROS CLIENTES</span></h2>
            <p className="subtitulo-seccion">La satisfacción de nuestros clientes es nuestra mayor recompensa.</p>
          </div>
          <div className="reseñas-cuadricula">
            {reseñas.map((r, i) => (
              <div key={i} className="tarjeta-reseña animar-entrada" style={{ transitionDelay: `${i * 0.07}s` }}>
                <div className="reseña-encabezado">
                  <div className="reseña-avatar" style={{ background: `linear-gradient(135deg,${r.color[0]},${r.color[1]})` }}>{r.iniciales}</div>
                  <div>
                    <div className="reseña-nombre-autor">{r.nombre}</div>
                    <div className="reseña-estrellas">
                      {Array.from({ length: 5 }, (_, j) => <span key={j} className={j < r.estrellas ? 'estrella-llena' : 'estrella-vacia'}>★</span>)}
                    </div>
                    <div className="reseña-fecha">{r.fecha}</div>
                  </div>
                </div>
                <p className="reseña-texto">{r.texto}</p>
              </div>
            ))}
          </div>

          <div className="formulario-reseña animar-entrada">
            <h3>Comparte Tu Experiencia</h3>
            <p className="formulario-reseña-subtitulo">Tu opinión nos ayuda a crecer.</p>
            <label className="campo-checkbox">
              <input type="checkbox" checked={mostrarNombre} onChange={e => setMostrarNombre(e.target.checked)} />
              <span>Quiero que aparezca mi nombre</span>
            </label>
            {mostrarNombre ? (
              <div className="campo-formulario">
                <label>Tu Nombre</label>
                <input type="text" placeholder="Escribe tu nombre completo..." value={formReseña.nombre} onChange={e => setFormReseña(f => ({ ...f, nombre: e.target.value }))} />
              </div>
            ) : (
              <div className="aviso-anonimo">😶‍🌫️ Comentario enviado de forma anónima</div>
            )}
            <div className="campo-formulario">
              <label>Calificación</label>
              <select value={formReseña.calificacion} onChange={e => setFormReseña(f => ({ ...f, calificacion: e.target.value }))}>
                <option value="">Selecciona tu calificación...</option>
                <option value="5">★★★★★ Excelente</option>
                <option value="4">★★★★☆ Muy Bueno</option>
                <option value="3">★★★☆☆ Bueno</option>
                <option value="2">★★☆☆☆ Regular</option>
                <option value="1">★☆☆☆☆ Necesita Mejorar</option>
              </select>
            </div>
            <div className="campo-formulario">
              <label>Tu Opinión</label>
              <textarea rows={4} placeholder="Cuéntanos sobre tu experiencia..." maxLength={500} value={formReseña.texto}
                onChange={e => { setFormReseña(f => ({ ...f, texto: e.target.value })); setContadorTexto(e.target.value.length); }} />
              <div className="contadorCaracteres" style={{ color: contadorTexto > 450 ? 'var(--red)' : contadorTexto > 350 ? '#ffaa00' : 'var(--text-muted)' }}>{contadorTexto} / 500</div>
            </div>
            <button className="boton-enviar-formulario" onClick={enviarReseña}>Enviar Opinión</button>
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