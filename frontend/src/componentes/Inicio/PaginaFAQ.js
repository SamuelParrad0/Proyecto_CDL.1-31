import React, { useState } from 'react';
import NavegacionPrincipal from '../compartidos/NavegacionPrincipal';
import BarraEntrega from '../compartidos/BarraEntrega';
import RedesSocialesFlotantes from '../compartidos/RedesSocialesFlotantes';
import { useToast } from '../compartidos/useToast';
import { useScrollReveal } from '../compartidos/useScrollReveal';
import { DATOS_FAQ } from '../../datos/datos';

export default function PaginaFAQ() {
  const { toastMensaje, toastVisible, mostrarToast } = useToast();
  const [faqAbierta, setFaqAbierta] = useState(null);
  useScrollReveal();

  return (
    <div>
      <BarraEntrega mostrarToast={mostrarToast} />
      <NavegacionPrincipal />

      <section className="seccion-preguntas seccion-espaciado" style={{ paddingTop: '120px' }}>
        <div className="contenedor">
          <div className="encabezado-seccion animar-entrada">
            <span className="etiqueta-seccion">Ayuda</span>
            <h2 className="titulo-seccion">PREGUNTAS <span>FRECUENTES</span></h2>
          </div>
          <div className="preguntas-lista">
            {DATOS_FAQ.map((item, i) => (
              <div key={i} className={`pregunta-item animar-entrada${faqAbierta === i ? ' open' : ''}`}>
                <button className="pregunta-boton" onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}>
                  <span>{item.pregunta}</span>
                  <span className="pregunta-icono-expandir">{faqAbierta === i ? '−' : '+'}</span>
                </button>
                <div className="pregunta-respuesta">{item.respuesta}</div>
              </div>
            ))}
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