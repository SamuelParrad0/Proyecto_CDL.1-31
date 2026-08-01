import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { crearReservaAPI, haySesionActiva, obtenerPaquetesAPI } from '../../servicios/api';
import '../../estilos/citas.css';


export default function PaginaCitas() {
  const navigate = useNavigate();
  const [paquetePrevio, setPaquetePrevio] = useState(null);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState({});
  const [paquetesCita, setPaquetesCita] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [tituloTexto, setTituloTexto] = useState('');
  const [form, setForm] = useState({
    nombreCompleto: '', correoElectronico: '', numeroTelefono: '',
    tipoEvento: '', fechaEvento: '', horaEvento: '', lugarEvento: '',
    numeroPersonas: '', detallesAdicionales: ''
  });

  const textoCompleto = 'Communicating Design Lion';
  const toastBarRef = useRef(null);
  const toastRef = useRef(null);

  // Efecto de escritura en el título
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx <= textoCompleto.length) {
        setTituloTexto(textoCompleto.slice(0, idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Cargar paquetes desde la API
  useEffect(() => {
    const cargarPaquetes = async () => {
      try {
        const res = await obtenerPaquetesAPI();
        const activos = (res || []).filter(p => p.Activo).map(p => ({
          id: `paquete_${p.Id_Paquete}`,
          idBackend: p.Id_Paquete,
          icono: '📸',
          label: p.Nombre_Paquete || 'Paquete',
          value: p.Nombre_Paquete || 'paquete'
        }));
        setPaquetesCita(activos);
      } catch (error) {
        console.error('Error cargando paquetes:', error);
      }
    };
    cargarPaquetes();
  }, []);

  // Preseleccionar paquete desde localStorage
  useEffect(() => {
    const raw = localStorage.getItem('cdl_cita_previa');
    if (!raw) return;
    try {
      const paquete = JSON.parse(raw);
      localStorage.removeItem('cdl_cita_previa');
      setPaquetePrevio(paquete);
      // Intentar preseleccionar el paquete por nombre
      const nombre = (paquete.nombre || '').toLowerCase();
      if (paquetesCita.length > 0) {
        const encontrado = paquetesCita.find(p => (p.label || '').toLowerCase().includes(nombre) || nombre.includes((p.label || '').toLowerCase()));
        if (encontrado) {
          setPaquetesSeleccionados({ [encontrado.id]: true });
          setTimeout(() => document.querySelector('.cuadricula-servicios')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
        }
      }
    } catch {}
  }, [paquetesCita]);

  const mostrarToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3800);
  };

  const togglePaquete = (id) => {
    setPaquetesSeleccionados(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cambiar = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const enviar = async (e) => {
    e.preventDefault();
    
    if (!haySesionActiva()) {
      alert('Debes iniciar sesión para agendar una cita.');
      navigate('/login');
      return;
    }

    const seleccionados = Object.entries(paquetesSeleccionados)
      .filter(([_, sel]) => sel)
      .map(([id]) => {
        const paq = paquetesCita.find(p => p.id === id);
        return paq ? paq.idBackend : null;
      })
      .filter(Boolean);

    if (seleccionados.length === 0) {
      alert('Por favor selecciona al menos un paquete de servicios.');
      return;
    }

    setEnviando(true);
    
    try {
      const datosCita = {
        paqueteId: seleccionados[0],
        nombreCompleto: form.nombreCompleto,
        correo: form.correoElectronico,
        numeroTelefono: form.numeroTelefono,
        tipoEvento: form.tipoEvento,
        fechaEvento: form.fechaEvento,
        numeroInvitados: form.numeroPersonas || null,
        informacionAdicional: `${form.lugarEvento ? 'Lugar: ' + form.lugarEvento + '. ' : ''}${form.horaEvento ? 'Hora: ' + form.horaEvento + '. ' : ''}${form.detallesAdicionales || ''}`
      };

      await crearReservaAPI(datosCita);
      
      mostrarToast();
      setForm({ nombreCompleto:'', correoElectronico:'', numeroTelefono:'', tipoEvento:'', fechaEvento:'', horaEvento:'', lugarEvento:'', numeroPersonas:'', detallesAdicionales:'' });
      setPaquetesSeleccionados({});
      setPaquetePrevio(null);
    } catch (error) {
      alert('Error al enviar solicitud: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pagina-citas">
      {/* Toast */}
      <div
        ref={toastRef}
        style={{
          position:'fixed', bottom:'40px', left:'50%', zIndex:99999,
          background:'linear-gradient(135deg,rgba(10,10,20,0.98),rgba(15,15,30,0.98))',
          border:'1.5px solid rgba(255,0,50,0.5)', borderRadius:'16px', padding:'24px 32px',
          maxWidth:'480px', width:'90%', boxShadow:'0 8px 40px rgba(255,0,50,0.25),0 2px 12px rgba(0,0,0,0.6)',
          textAlign:'center', pointerEvents: toastVisible ? 'auto' : 'none',
          opacity: toastVisible ? 1 : 0,
          transform: toastVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(200px)',
          transition:'opacity 0.4s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div style={{fontSize:'2rem',marginBottom:'10px',lineHeight:1}}>🎉</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'1.1rem',letterSpacing:'3px',color:'#ff0032',marginBottom:'10px',textTransform:'uppercase'}}>¡Solicitud Recibida!</div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'0.98rem',color:'#c8c8d8',lineHeight:1.65,margin:'0 0 14px'}}>Gracias por confiar en nosotros. Hemos recibido tu solicitud y muy pronto nos pondremos en contacto contigo.</p>
        <div ref={toastBarRef} style={{height:'2px',background:'linear-gradient(90deg,#ff0032,#ff6688)',borderRadius:'2px',width: toastVisible ? '100%' : '0%',transition: toastVisible ? 'width 3s linear 0.4s' : 'none'}}></div>
      </div>

      {/* Botón volver */}
      <div style={{position:'fixed',top:'20px',left:'20px',zIndex:9999}}>
        <Link to="/" style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(10,10,10,0.92)',border:'1.5px solid rgba(255,0,50,0.45)',color:'#ff0032',padding:'10px 20px',borderRadius:'10px',fontFamily:'Arial,sans-serif',fontSize:'0.85rem',fontWeight:700,textDecoration:'none',backdropFilter:'blur(12px)',boxShadow:'0 4px 20px rgba(255,0,50,0.2)',letterSpacing:'0.5px'}}>
          ← Volver al inicio
        </Link>
      </div>

      <div className="contenedor-principal-formulario">
        <div className="encabezado-formulario">
          <h1 className="titulo-empresa-brillante">{tituloTexto}<span className="cursor-parpadeo">|</span></h1>
          <div className="linea-divisoria"></div>
          <p>Servicios De Fotografía y Videofilmación Profesional</p>
          <p style={{fontSize:'0.9em',color:'#666'}}>Cada detalle pensado para ofrecer una experiencia visual y sensorial única, que eleva la entrega a un momento verdaderamente inolvidable.</p>
        </div>

        <div className="contenedor-formulario-servicios">
          <form id="formularioFotografia" onSubmit={enviar}>

            {/* Paquete preseleccionado */}
            {paquetePrevio && (
              <div id="seccionPaqueteCita" style={{marginBottom:'30px'}}>
                <div style={{display:'grid',gridTemplateColumns:'180px 1fr',gap:'28px',alignItems:'center',background:'linear-gradient(135deg,rgba(255,0,50,0.06),rgba(10,10,10,0.7))',border:'2px solid rgba(255,0,50,0.35)',borderRadius:'16px',padding:'24px',boxShadow:'0 0 35px rgba(255,0,50,0.1)'}}>
                  <img src={paquetePrevio.imagen} alt="Paquete" style={{width:'100%',height:'140px',objectFit:'cover',borderRadius:'10px',border:'1px solid rgba(255,0,50,0.25)'}} />
                  <div>
                    <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:'rgba(255,0,50,0.12)',border:'1px solid rgba(255,0,50,0.35)',color:'#ff4466',fontSize:'0.72rem',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',padding:'4px 12px',borderRadius:'20px',marginBottom:'10px'}}>📸 Paquete Seleccionado</div>
                    <h3 style={{fontSize:'1.6rem',fontWeight:700,color:'#fff',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>{paquetePrevio.nombre}</h3>
                    <div style={{fontSize:'1.8rem',fontWeight:700,color:'#ff0032',textShadow:'0 0 15px rgba(255,0,50,0.4)'}}>
                      {paquetePrevio.precio ? `$${Number(paquetePrevio.precio).toLocaleString('es-CO')}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información Personal */}
            <div className="seccion-formulario">
              <h3 className="titulo-seccion-formulario">Información Personal</h3>
              <div className="fila-campos-formulario">
                <div className="grupo-campo-formulario">
                  <label htmlFor="nombreCompleto">Nombre Completo <span className="campo-obligatorio">*</span></label>
                  <input type="text" id="nombreCompleto" required placeholder="Escribe tu nombre completo" value={form.nombreCompleto} onChange={e => cambiar('nombreCompleto', e.target.value)} />
                </div>
                <div className="grupo-campo-formulario">
                  <label htmlFor="correoElectronico">Correo Electrónico <span className="campo-obligatorio">*</span></label>
                  <input type="email" id="correoElectronico" required placeholder="ejemplo@correo.com" value={form.correoElectronico} onChange={e => cambiar('correoElectronico', e.target.value)} />
                </div>
              </div>
              <div className="grupo-campo-formulario">
                <label htmlFor="numeroTelefono">Número de Teléfono <span className="campo-obligatorio">*</span></label>
                <input type="tel" id="numeroTelefono" required placeholder="+57 300 000 0000" value={form.numeroTelefono} onChange={e => cambiar('numeroTelefono', e.target.value)} />
              </div>
            </div>

            {/* Detalles del Evento */}
            <div className="seccion-formulario">
              <h3 className="titulo-seccion-formulario">Detalles del Evento</h3>
              <div className="fila-campos-formulario">
                <div className="grupo-campo-formulario">
                  <label htmlFor="tipoEvento">Tipo de Evento <span className="campo-obligatorio">*</span></label>
                  <select id="tipoEvento" required value={form.tipoEvento} onChange={e => cambiar('tipoEvento', e.target.value)}>
                    <option value="">Selecciona el tipo de evento</option>
                    <option value="boda">Boda</option>
                    <option value="quinceaños">Quinceaños</option>
                    <option value="cumpleaños">Cumpleaños</option>
                    <option value="graduacion">Graduación</option>
                    <option value="corporativo">Corporativo</option>
                    <option value="familiar">Familiar</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="grupo-campo-formulario">
                  <label htmlFor="fechaEvento">Fecha del Evento <span className="campo-obligatorio">*</span></label>
                  <input type="date" id="fechaEvento" required value={form.fechaEvento} onChange={e => cambiar('fechaEvento', e.target.value)} />
                </div>
              </div>
              <div className="fila-campos-formulario">
                <div className="grupo-campo-formulario">
                  <label htmlFor="horaEvento">Hora del Evento</label>
                  <input type="time" id="horaEvento" value={form.horaEvento} onChange={e => cambiar('horaEvento', e.target.value)} />
                </div>
                <div className="grupo-campo-formulario">
                  <label htmlFor="lugarEvento">Lugar del Evento <span className="campo-obligatorio">*</span></label>
                  <input type="text" id="lugarEvento" required placeholder="Ciudad, salón o dirección" value={form.lugarEvento} onChange={e => cambiar('lugarEvento', e.target.value)} />
                </div>
              </div>
              <div className="grupo-campo-formulario">
                <label htmlFor="numeroPersonas">Número de Personas</label>
                <select id="numeroPersonas" value={form.numeroPersonas} onChange={e => cambiar('numeroPersonas', e.target.value)}>
                  <option value="">Selecciona el rango</option>
                  <option value="1-10">1-10 personas</option>
                  <option value="11-25">11-25 personas</option>
                  <option value="26-50">26-50 personas</option>
                  <option value="51-100">51-100 personas</option>
                  <option value="101-200">101-200 personas</option>
                  <option value="mas-200">Más de 200 personas</option>
                </select>
              </div>
            </div>

            {/* Paquetes Disponibles */}
            <div className="seccion-formulario">
              <h3 className="titulo-seccion-formulario">Paquetes Disponibles</h3>
              <div className="cuadricula-servicios">
                {paquetesCita.length === 0 ? (
                  <div style={{gridColumn:'1/-1',textAlign:'center',color:'#999',padding:'20px'}}>Cargando paquetes...</div>
                ) : paquetesCita.map(p => (
                  <div
                    key={p.id}
                    className="item-servicio"
                    onClick={() => togglePaquete(p.id)}
                    style={paquetesSeleccionados[p.id] ? { background:'linear-gradient(135deg,rgba(255,0,50,0.15),rgba(255,0,50,0.05))', borderColor:'rgba(255,0,50,0.6)', boxShadow:'0 10px 25px rgba(255,0,50,0.25)', transform:'translateY(-3px)' } : {}}
                  >
                    <input type="checkbox" id={p.id} name="servicios[]" value={p.value}
                      checked={!!paquetesSeleccionados[p.id]}
                      onChange={() => togglePaquete(p.id)}
                      onClick={e => e.stopPropagation()} />
                    <label htmlFor={p.id}>{p.icono} {p.label}</label>
                  </div>
                ))}
              </div>
              <div className="texto-informativo">
                💡 <strong>Consejo:</strong> Selecciona al menos un servicio. Los paquetes combinados ofrecen mejor precio y cobertura completa de tu evento.
              </div>
            </div>

            {/* Información Adicional */}
            <div className="seccion-formulario">
              <h3 className="titulo-seccion-formulario">Información Adicional</h3>
              <div className="grupo-campo-formulario">
                <label htmlFor="detallesAdicionales">Detalles y Requerimientos Especiales</label>
                <textarea id="detallesAdicionales" placeholder="Cuéntanos más sobre tu evento: estilo preferido, momentos especiales que quieres capturar, ubicación, horario, o cualquier requerimiento especial..." value={form.detallesAdicionales} onChange={e => cambiar('detallesAdicionales', e.target.value)}></textarea>
              </div>
            </div>

            <button type="submit" className="boton-enviar-formulario" disabled={enviando}
              style={enviando ? { background:'linear-gradient(135deg,#666,#444)' } : {}}>
              {enviando ? '⏳ Enviando solicitud...' : 'Solicitar Contacto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
