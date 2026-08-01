import React, { useState, useEffect } from 'react';
import { crearDireccionAPI, haySesionActiva } from '../../servicios/api';

const CLAVE_DIRECCION = 'cdl_direccion';
const DEPARTAMENTOS = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bogotá','Bolívar','Boyacá','Caldas','Caquetá','Casanare',
  'Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare','Huila','La Guajira','Magdalena',
  'Meta','Nariño','Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés y Providencia',
  'Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'
];

function leerDireccion() {
  try { return JSON.parse(localStorage.getItem(CLAVE_DIRECCION) || '{}'); } catch { return {}; }
}

function textoResumen(datos) {
  if (!datos.direccion) return 'Agregar dirección de entrega';
  const partes = [];
  if (datos.nombre) partes.push(datos.nombre);
  if (datos.direccion) partes.push(datos.direccion);
  if (datos.municipio) partes.push(datos.municipio);
  else if (datos.departamento) partes.push(datos.departamento);
  return partes.join(' — ') || 'Agregar dirección de entrega';
}

export default function BarraEntrega({ mostrarToast }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [textoEntrega, setTextoEntrega] = useState('Agregar dirección de entrega');
  const [depListaAbierta, setDepListaAbierta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [sesionActiva] = useState(haySesionActiva());
  const [form, setForm] = useState({
    nombre: '', direccion: '', sinComplemento: false, departamento: '',
    municipio: '', barrio: '', apto: '', telefono: '', indicaciones: '', tipo: 'residencial'
  });

  useEffect(() => {
    if (!sesionActiva) return;
    const datos = leerDireccion();
    if (datos.direccion) setTextoEntrega(textoResumen(datos));
  }, [sesionActiva]);

  // Si no hay sesión activa, no mostrar la barra
  if (!sesionActiva) return null;

  const abrirModal = () => {
    const datos = leerDireccion();
    if (datos.nombre) setForm(f => ({ ...f, ...datos }));
    setModalAbierto(true);
    document.body.style.overflow = 'hidden';
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    document.body.style.overflow = '';
    setDepListaAbierta(false);
  };

  const guardar = async () => {
    if (!form.direccion.trim()) { mostrarToast('⚠️ Ingresa la dirección de entrega'); return; }
    if (!form.departamento) { mostrarToast('⚠️ Selecciona un departamento'); return; }

    localStorage.setItem(CLAVE_DIRECCION, JSON.stringify(form));
    setTextoEntrega(textoResumen(form));

    try {
      setGuardando(true);
      await crearDireccionAPI({
        nombre: form.nombre,
        direccion: form.direccion,
        departamento: form.departamento,
        municipio: form.municipio,
        barrio: form.barrio,
        apto: form.apto,
        telefono: form.telefono,
        indicaciones: form.indicaciones,
        tipo: form.tipo
      });
    } catch (e) {
      console.error('Error al guardar dirección en BD:', e.message);
    } finally {
      setGuardando(false);
    }

    cerrarModal();
    mostrarToast('📍 Dirección guardada correctamente');
  };

  const cambiar = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  return (
    <>
      <div className="barra-entrega" id="barraEntrega">
        <div className="barra-entrega-izquierda" onClick={abrirModal} title="Cambiar dirección">
          <i className="fas fa-map-marker-alt barra-entrega-icono"></i>
          <div className="barra-entrega-texto">
            <span>Entregar a:</span>
            <span id="textoBarraEntrega">{textoEntrega}</span>
          </div>
          <i className="fas fa-chevron-down" style={{color:'var(--text-muted)',fontSize:'0.55rem',marginLeft:'2px'}}></i>
        </div>
        <div className="barra-entrega-derecha">
          <div className="barra-entrega-etiqueta">
            <div className="barra-entrega-punto"></div> Tu experiencia, en cualquier lugar de Colombia
          </div>
        </div>
      </div>

      {/* Modal Dirección */}
      <div
        id="modalDireccion"
        onClick={(e) => e.target === e.currentTarget && cerrarModal()}
        style={{display: modalAbierto ? 'flex' : 'none', position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:9998, alignItems:'center', justifyContent:'center', padding:'1.5rem'}}
      >
        <div style={{background:'var(--bg-2)', border:'1px solid var(--border-red)', borderRadius:'18px', width:'100%', maxWidth:'500px', maxHeight:'90vh', overflowY:'auto', padding:'2rem 2.2rem', boxShadow:'0 0 60px var(--red-glow)', position:'relative'}}>
          <button onClick={cerrarModal} style={{position:'absolute',top:'14px',right:'14px',background:'none',border:'1px solid var(--border)',color:'var(--text-secondary)',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          <div style={{marginBottom:'1.4rem'}}>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',color:'var(--red)',fontWeight:700,marginBottom:'4px'}}>— Dirección de entrega</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'1.7rem',letterSpacing:'2px',color:'#fff'}}>¿A dónde entregamos?</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.9rem'}}>
            <InputModal label="Nombre completo" placeholder="Tu nombre completo" value={form.nombre} onChange={v => cambiar('nombre', v)} />
            <div>
              <LabelModal>Dirección o lugar de entrega</LabelModal>
              <InputModal placeholder="Ej: Carrera 71d #1-14 Sur" value={form.direccion} onChange={v => cambiar('direccion', v)} />
              <label style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'7px',fontFamily:"'DM Sans',sans-serif",fontSize:'0.82rem',color:'var(--text-secondary)',cursor:'pointer'}}>
                <input type="checkbox" checked={form.sinComplemento} onChange={e => cambiar('sinComplemento', e.target.checked)} style={{accentColor:'var(--red)',width:'15px',height:'15px'}} /> Sin complemento
              </label>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.9rem'}}>
              <div style={{position:'relative'}}>
                <LabelModal>Departamento</LabelModal>
                <div onClick={() => setDepListaAbierta(p => !p)} style={{width:'100%',background:'var(--bg-0)',border:`1px solid ${depListaAbierta ? 'var(--red)' : 'var(--border)'}`,color: form.departamento ? '#fff' : 'var(--text-secondary)',padding:'10px 14px',borderRadius:'8px',fontFamily:"'DM Sans',sans-serif",fontSize:'0.88rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',userSelect:'none'}}>
                  <span>{form.departamento || 'Selecciona departamento'}</span>
                  <i className="fas fa-chevron-down" style={{fontSize:'0.65rem',color:'var(--text-muted)',transform: depListaAbierta ? 'rotate(180deg)' : 'rotate(0deg)',transition:'transform 0.3s'}}></i>
                </div>
                {depListaAbierta && (
                  <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--bg-1)',border:'1px solid var(--border-red)',borderRadius:'8px',zIndex:9999,maxHeight:'200px',overflowY:'auto',boxShadow:'0 8px 24px rgba(0,0,0,0.7)'}}>
                    <div style={{padding:'9px 14px',fontFamily:"'DM Sans',sans-serif",fontSize:'0.82rem',color:'var(--text-muted)',borderBottom:'1px solid var(--border)'}}>— Selecciona un departamento —</div>
                    {DEPARTAMENTOS.map(dep => (
                      <div key={dep} className="departamento-opcion" onClick={() => { cambiar('departamento', dep); setDepListaAbierta(false); }} style={{color: form.departamento === dep ? 'var(--red)' : '', background: form.departamento === dep ? 'rgba(255,8,68,0.08)' : ''}}>{dep}</div>
                    ))}
                  </div>
                )}
              </div>
              <InputModal label="Municipio / Localidad" placeholder="Escribe tu municipio" value={form.municipio} onChange={v => cambiar('municipio', v)} />
            </div>
            <InputModal label="Barrio" placeholder="Nombre del barrio" value={form.barrio} onChange={v => cambiar('barrio', v)} />
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.9rem'}}>
              <InputModal label="Apto / Casa (opcional)" placeholder="Ej: 201" value={form.apto} onChange={v => cambiar('apto', v)} />
              <InputModal label="Teléfono" placeholder="+57 300 123 4567" type="tel" value={form.telefono} onChange={v => cambiar('telefono', v)} />
            </div>
            <div>
              <LabelModal>Indicaciones para la entrega <span style={{color:'var(--text-muted)',fontSize:'0.55rem'}}>(opcional)</span></LabelModal>
              <textarea value={form.indicaciones} onChange={e => cambiar('indicaciones', e.target.value)} maxLength={128} rows={2} placeholder="Ej: Entre calles, color del edificio, no tiene timbre..." style={{width:'100%',background:'var(--bg-0)',border:'1px solid var(--border)',color:'#fff',padding:'10px 14px',borderRadius:'8px',fontFamily:"'DM Sans',sans-serif",fontSize:'0.88rem',outline:'none',resize:'none',lineHeight:1.5}} onFocus={e => e.target.style.borderColor='var(--red)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
              <div style={{textAlign:'right',fontSize:'0.68rem',color:'var(--text-muted)',fontFamily:"'Rajdhani',sans-serif",marginTop:'2px'}}>{form.indicaciones.length} / 128</div>
            </div>
            <div>
              <LabelModal>Tipo de domicilio</LabelModal>
              <div style={{display:'flex',gap:'10px'}}>
                {['residencial','laboral'].map(tipo => (
                  <label key={tipo} style={{flex:1,display:'flex',alignItems:'center',gap:'8px',background:'var(--bg-0)',border:`1px solid ${form.tipo===tipo ? 'var(--red)' : 'var(--border)'}`,borderRadius:'8px',padding:'10px 14px',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:'0.85rem',color:'var(--text-secondary)'}}>
                    <input type="radio" name="tipoDomicilio" value={tipo} checked={form.tipo===tipo} onChange={() => cambiar('tipo', tipo)} style={{accentColor:'var(--red)'}} />
                    <i className={`fas fa-${tipo==='residencial' ? 'home' : 'briefcase'}`} style={{color:'var(--red)',fontSize:'0.8rem'}}></i>
                    {tipo.charAt(0).toUpperCase()+tipo.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button onClick={guardar} disabled={guardando} style={{width:'100%',marginTop:'1.3rem',background:'var(--red)',border:'none',color:'#fff',padding:'13px',borderRadius:'10px',fontFamily:"'Rajdhani',sans-serif",fontSize:'0.88rem',fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',cursor:'pointer',transition:'var(--transition)',boxShadow:'0 4px 18px var(--red-glow)',opacity: guardando ? 0.7 : 1}}>
            <i className="fas fa-map-marker-alt" style={{marginRight:'8px'}}></i>
            {guardando ? 'Guardando...' : 'Guardar dirección'}
          </button>
        </div>
      </div>
    </>
  );
}

function LabelModal({ children }) {
  return <label style={{fontFamily:"'Rajdhani',sans-serif",fontSize:'0.62rem',letterSpacing:'2px',textTransform:'uppercase',color:'var(--red)',fontWeight:700,display:'block',marginBottom:'5px'}}>{children}</label>;
}

function InputModal({ label, placeholder, value, onChange, type = 'text' }) {
  return (
    <div>
      {label && <LabelModal>{label}</LabelModal>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{width:'100%',background:'var(--bg-0)',border:'1px solid var(--border)',color:'#fff',padding:'10px 14px',borderRadius:'8px',fontFamily:"'DM Sans',sans-serif",fontSize:'0.9rem',outline:'none'}}
        onFocus={e => e.target.style.borderColor='var(--red)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
    </div>
  );
}