import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { crearPersonalizadoAPI, haySesionActiva } from '../../servicios/api';
import '../../estilos/personalizado.css';

const TEXTO_TITULO = 'Personaliza tu Experiencia';

export default function PaginaPersonalizado() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [modalExito, setModalExito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    nombreCompleto: '', correoElectronico: '', numeroTelefono: '',
    destinatario: 'para_mi', descripcionIdea: '', elementosEsenciales: '',
    prioridadCliente: '', comentariosAdicionales: ''
  });
  const [errores, setErrores] = useState({});
  let toastTimer = useRef(null);

  // Efecto typewriter
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= TEXTO_TITULO.length) { setTitulo(TEXTO_TITULO.slice(0, idx)); idx++; }
      else clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, []);

  const mostrarToastError = (msg) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3500);
  };

  const cambiar = (c, v) => {
    setForm(f => ({ ...f, [c]: v }));
    if (errores[c]) setErrores(e => ({ ...e, [c]: false }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const obligatorios = ['nombreCompleto', 'correoElectronico', 'numeroTelefono', 'descripcionIdea'];
    const nuevosErrores = {};
    let primerError = null;
    obligatorios.forEach(campo => {
      if (!form[campo].trim()) {
        nuevosErrores[campo] = true;
        if (!primerError) primerError = campo;
      }
    });
    if (Object.keys(nuevosErrores).length) {
      setErrores(nuevosErrores);
      mostrarToastError('Completa todos los campos obligatorios.');
      document.getElementById(primerError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById(primerError)?.focus();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.correoElectronico.trim())) {
      setErrores(p => ({ ...p, correoElectronico: true }));
      mostrarToastError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!haySesionActiva()) {
      mostrarToastError('Debes iniciar sesión para enviar una solicitud.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setEnviando(true);
    
    try {
      const datosIn = {
        nombreCompleto: form.nombreCompleto,
        correo: form.correoElectronico,
        telefono: form.numeroTelefono,
        destinatario: form.destinatario,
        descripcionIdea: form.descripcionIdea,
        elementosEsenciales: form.elementosEsenciales,
        prioridadCliente: form.prioridadCliente,
        comentariosAdicionales: form.comentariosAdicionales
      };

      await crearPersonalizadoAPI(datosIn);

      setForm({ nombreCompleto:'', correoElectronico:'', numeroTelefono:'', destinatario:'para_mi', descripcionIdea:'', elementosEsenciales:'', prioridadCliente:'', comentariosAdicionales:'' });
      setErrores({});
      setModalExito(true);
      document.body.style.overflow = 'hidden';
    } catch (error) {
      mostrarToastError(error.message || 'Error al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const cerrarModal = () => {
    setModalExito(false);
    document.body.style.overflow = '';
  };

  const inputStyle = (campo) => ({
    outline: errores[campo] ? '2px solid #ff0844' : 'none',
    borderColor: errores[campo] ? '#ff0844' : undefined
  });

  return (
    <div className="pagina-personalizado">
      {/* Botón volver */}
      <Link className="enlace-volver-al-inicio" to="/">
        <i className="fas fa-arrow-left"></i> Volver
      </Link>

      {/* Hero */}
      <div className="encabezado-hero">
        <div className="etiqueta-nombre-marca">
          <span className="punto-parpadeante-marca"></span>
          Communicating Design Lion &nbsp;·&nbsp; Servicio Personalizado
        </div>
        <h1 className="titulo-principal-hero">
          {titulo}<span style={{ opacity: 0.7, animation: 'blink 1s step-end infinite' }}>|</span>
        </h1>
        <p className="frase-motivacional-hero">
          Cuéntanos tu idea y nosotros <span className="acento-rojo-frase">la hacemos realidad.</span>
        </p>
        <div className="linea-separadora-hero"></div>
      </div>

      {/* Formulario */}
      <div className="contenedor-pagina-principal">
        <div className="tarjeta-contenedor-formulario">
          <form id="formulario-solicitud-personalizada" onSubmit={enviar}>

            {/* Sección 1 — Info personal */}
            <div className="bloque-seccion-formulario">
              <h3 className="titulo-seccion-formulario">👤 Información Personal</h3>
              <div className="fila-dos-columnas">
                <div className="grupo-campo-formulario">
                  <label htmlFor="nombreCompleto">Nombre Completo <span className="indicador-campo-obligatorio">*</span></label>
                  <input type="text" id="nombreCompleto" name="nombreCompleto" required
                    placeholder="Tu nombre completo" value={form.nombreCompleto}
                    onChange={e => cambiar('nombreCompleto', e.target.value)} style={inputStyle('nombreCompleto')} />
                </div>
                <div className="grupo-campo-formulario">
                  <label htmlFor="correoElectronico">Correo Electrónico <span className="indicador-campo-obligatorio">*</span></label>
                  <input type="email" id="correoElectronico" name="correoElectronico" required
                    placeholder="ejemplo@correo.com" value={form.correoElectronico}
                    onChange={e => cambiar('correoElectronico', e.target.value)} style={inputStyle('correoElectronico')} />
                </div>
              </div>
              <div className="grupo-campo-formulario">
                <label htmlFor="numeroTelefono">Número de Teléfono <span className="indicador-campo-obligatorio">*</span></label>
                <input type="tel" id="numeroTelefono" name="numeroTelefono" required
                  placeholder="+57 300 000 0000" value={form.numeroTelefono}
                  onChange={e => cambiar('numeroTelefono', e.target.value)} style={inputStyle('numeroTelefono')} />
              </div>
              <div className="grupo-campo-formulario grupo-campo-formulario--sin-margen">
                <label>¿Es para ti o para alguien más? <span className="indicador-campo-obligatorio">*</span></label>
                <div className="contenedor-opciones-destinatario">
                  <div className="opcion-destinatario">
                    <input type="radio" id="radio-para-mi" name="destinatario" value="para_mi"
                      checked={form.destinatario==='para_mi'} onChange={() => cambiar('destinatario','para_mi')} />
                    <label htmlFor="radio-para-mi"><i className="fas fa-user"></i> Para mí</label>
                  </div>
                  <div className="opcion-destinatario">
                    <input type="radio" id="radio-para-otra-persona" name="destinatario" value="para_otro"
                      checked={form.destinatario==='para_otro'} onChange={() => cambiar('destinatario','para_otro')} />
                    <label htmlFor="radio-para-otra-persona"><i className="fas fa-user-friends"></i> Para otra persona</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2 — Tu idea */}
            <div className="bloque-seccion-formulario">
              <h3 className="titulo-seccion-formulario">💡 Tu Idea</h3>
              <div className="grupo-campo-formulario">
                <label htmlFor="descripcionIdea">Describe tu idea <span className="indicador-campo-obligatorio">*</span></label>
                <textarea id="descripcionIdea" name="descripcionIdea" required
                  placeholder="Cuéntanos qué tienes en mente. Puede ser una descripción general, una referencia visual, un estilo, un momento especial..."
                  value={form.descripcionIdea} onChange={e => cambiar('descripcionIdea', e.target.value)}
                  style={inputStyle('descripcionIdea')}></textarea>
              </div>
              <div className="grupo-campo-formulario">
                <label htmlFor="elementosEsenciales">¿Hay algo específico que no puede faltar?</label>
                <textarea className="textarea-altura-reducida" id="elementosEsenciales" name="elementosEsenciales"
                  placeholder="Por ejemplo: una persona, un objeto, un color, un lugar, una emoción..."
                  value={form.elementosEsenciales} onChange={e => cambiar('elementosEsenciales', e.target.value)}></textarea>
              </div>
              <div className="grupo-campo-formulario grupo-campo-formulario--sin-margen">
                <label htmlFor="prioridadCliente">¿Qué es lo más importante para ti en este servicio?</label>
                <textarea className="textarea-altura-reducida" id="prioridadCliente" name="prioridadCliente"
                  placeholder="La calidad, la rapidez, el detalle, la emoción, el recuerdo..."
                  value={form.prioridadCliente} onChange={e => cambiar('prioridadCliente', e.target.value)}></textarea>
              </div>
            </div>

            {/* Sección 3 — Comentarios */}
            <div className="bloque-seccion-formulario">
              <h3 className="titulo-seccion-formulario">💬 Comentarios Finales</h3>
              <div className="grupo-campo-formulario grupo-campo-formulario--sin-margen">
                <label htmlFor="comentariosAdicionales">¿Hay algo más que quieras decirnos?</label>
                <textarea id="comentariosAdicionales" name="comentariosAdicionales"
                  placeholder="Cualquier detalle adicional, referencia, fecha límite, presupuesto aproximado..."
                  value={form.comentariosAdicionales} onChange={e => cambiar('comentariosAdicionales', e.target.value)}></textarea>
              </div>
            </div>

            <button type="submit" className="boton-enviar-solicitud" disabled={enviando}
              style={enviando ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
              {enviando ? '⏳ Enviando tu historia...' : '🔥 ¡Hagámoslo Realidad!'}
            </button>
          </form>
        </div>
      </div>

      {/* Toast error */}
      <div className={`toast-error-validacion${toastVisible ? ' toast--visible' : ''}`} id="toast-error-validacion">
        <span className="icono-toast-error">⚠️</span>
        <span className="texto-mensaje-toast">{toastMsg}</span>
        <div className="barra-progreso-toast"></div>
      </div>

      {/* Modal éxito */}
      {modalExito && (
        <div className="fondo-modal-exito modal-fondo--visible" id="fondo-modal-exito"
          onClick={e => e.target === e.currentTarget && cerrarModal()}>
          <div className="tarjeta-modal-exito">
            <div className="particula-decorativa-modal particula-decorativa-modal--superior-derecha"></div>
            <div className="particula-decorativa-modal particula-decorativa-modal--inferior-izquierda"></div>
            <div className="particula-decorativa-modal particula-decorativa-modal--lateral-derecha"></div>
            <div className="icono-corazon-modal">♥</div>
            <h2 className="titulo-modal-exito">¡Solicitud Enviada!</h2>
            <div className="linea-separadora-modal"></div>
            <p className="frase-emocional-modal">"Cada historia es diferente, y la tuya merece ser contada de la mejor manera."</p>
            <p className="mensaje-agradecimiento-modal">
              Gracias por confiar en <strong className="nombre-empresa-destacado">Communicating Design Lion</strong>
            </p>
            <p className="texto-informativo-modal">Pronto nos pondremos en contacto contigo para hacer realidad tu idea.</p>
            <button className="boton-cerrar-modal" onClick={cerrarModal}>Continuar</button>
          </div>
        </div>
      )}

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
