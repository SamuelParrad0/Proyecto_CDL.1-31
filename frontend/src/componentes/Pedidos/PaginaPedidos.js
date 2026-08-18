import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../../contexto/CarritoContexto';
import '../../estilos/pedidos.css';

const PRODUCTOS_PEDIDO = [
  { id:'producto1', value:'cajita-corazon',     nombre:'Cajita Corazón Personalizado',      precio:'20.000', descripcion:'Dulces variados como Choco Ball, Choco Break Cookies y Bianchi.',                               imagen:'Imagenes_Videos/Imagenes_Videos/Img-Productos/Cajita-corazon.png' },
  { id:'producto2', value:'bolsa-sorpresa',      nombre:'Bolsa Sorpresa Personalizado',       precio:'35.000', descripcion:'Incluye 1 cóctel con tequila de 269 ml, 1 Jumbo Flow y galletas.',                           imagen:'Imagenes_Videos/Imagenes_Videos/Img-Productos/Bolsa-Sorpresa.png' },
  { id:'producto3', value:'caja-multifotografia',nombre:'Caja Multifotográfica Personalizada',precio:'65.000', descripcion:'Incluye 1 caja de chocolate Moments, galletas y 3 fotografías personalizadas.',               imagen:'Imagenes_Videos/Imagenes_Videos/Img-Productos/Caja-multifotografia.png' },
  { id:'producto4', value:'libro-emocion',        nombre:'Libro Emoción Personalizado',        precio:'95.000', descripcion:'Incluye 1 caja de chocolate Moments y 1 lata de dulces Cavendish & Harvey.',                  imagen:'Imagenes_Videos/Imagenes_Videos/Img-Productos/Libro-emocion.png' },
];

const TEXTO_TITULO = 'Regalos que se convierten en recuerdos';

function parsePrecio(str) {
  return Number.parseFloat(str.replace(/\./g, '').replace(',', '.'));
}

export default function PaginaPedidos() {
  const navigate = useNavigate();
  const { agregarItem } = useCarrito();

  const [paquetePrevio, setPaquetePrevio] = useState(null);
  const [mostrarProductos, setMostrarProductos] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoVista, setProductoVista] = useState(null);
  const [imgVisible, setImgVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [form, setForm] = useState({ nombreCompleto:'', correoElectronico:'', telefono:'', nombreDestinatario:'', personalizacion:'' });

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      if (idx <= TEXTO_TITULO.length) { setTitulo(TEXTO_TITULO.slice(0, idx)); idx++; }
      else clearInterval(timer);
    }, 55);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('cdl_pedido_previo');
    if (!raw) return;
    try {
      const prev = JSON.parse(raw);
      localStorage.removeItem('cdl_pedido_previo');
      if (prev.tipo === 'paquete') {
        setPaquetePrevio(prev);
        setMostrarProductos(false);
      } else if (prev.tipo === 'producto') {
        const coincidente = PRODUCTOS_PEDIDO.find(p =>
          p.nombre.toLowerCase().includes(prev.nombre.toLowerCase().split(' ')[0])
        );
        if (coincidente) { setProductoSeleccionado(coincidente.value); seleccionarVista(coincidente); }
      }
    } catch {}
  }, []);

  const seleccionarVista = (producto) => {
    setImgVisible(false);
    setTimeout(() => { setProductoVista(producto); setImgVisible(true); }, 300);
  };

  const cambiar = (c, v) => setForm(f => ({ ...f, [c]: v }));

  const enviar = (e) => {
    e.preventDefault();
    const vieneDePaquete = paquetePrevio && !mostrarProductos;
    if (!vieneDePaquete && !productoSeleccionado) {
      alert('⚠️ Por favor, selecciona un producto antes de enviar tu solicitud.');
      return;
    }

    const cliente = { nombreCompleto: form.nombreCompleto, correoElectronico: form.correoElectronico, telefono: form.telefono, nombreDestinatario: form.nombreDestinatario };
    let nuevoItem;
    if (vieneDePaquete) {
      nuevoItem = { nombre: paquetePrevio.nombre, precio: paquetePrevio.precio, imagen: paquetePrevio.imagen, cliente, personalizacion: form.personalizacion || null };
    } else {
      const prod = PRODUCTOS_PEDIDO.find(p => p.value === productoSeleccionado);
      nuevoItem = { nombre: prod.nombre, precio: parsePrecio(prod.precio), imagen: prod.imagen, cliente, personalizacion: form.personalizacion || null };
    }

    agregarItem(nuevoItem);
    alert(`¡Solicitud enviada con éxito! 🎉\n\nCliente: ${cliente.nombreCompleto}\nProducto: ${nuevoItem.nombre}\n\nGracias por confiar en Communicating Design Lion.`);
    navigate('/carrito');
  };

  return (
    <div className="pagina-pedidos">
      <div className="contenedor-solicitud-pedidos">
        <div className="encabezado-pedidos">
          <h2>{titulo}</h2>
          <div className="linea-divisoria-pedidos"></div>
          <p>Cuéntanos el detalle que quieres regalar y juntos lo convertiremos en un recuerdo lleno de amor y significado para esa persona especial.</p>
        </div>

        <form className="contenedor-formulario-pedidos" id="formularioPedidos" onSubmit={enviar}>
          <div style={{ marginBottom: '20px' }}>
            <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'var(--color-acento)', textDecoration:'none', fontSize:'0.85rem', fontWeight:600 }}>
              ← Volver al inicio
            </Link>
          </div>

          {paquetePrevio && !mostrarProductos && (
            <div id="seccionPaqueteSeleccionado" style={{ display:'block', marginBottom:'45px', paddingBottom:'35px', borderBottom:'1px solid rgba(232,7,52,0.1)' }}>
              <div className="tarjeta-paquete-pedido">
                <img src={paquetePrevio.imagen} alt={paquetePrevio.nombre} />
                <div className="info-paquete-pedido">
                  <span className="badge-paquete">📸 Paquete Seleccionado</span>
                  <h4>{paquetePrevio.nombre}</h4>
                  <div className="precio-paquete-pedido">${Number(paquetePrevio.precio).toLocaleString('es-CO')}</div>
                </div>
              </div>
            </div>
          )}

          {mostrarProductos && (
            <div className="seccion-seleccion-producto">
              <h3 className="titulo-seccion-pedidos">Selecciona tu Producto</h3>
              <div className="contenedor-vista-previa">
                <div className="imagen-producto-grande">
                  {productoVista ? (
                    <img id="imagenProductoDestacado" src={productoVista.imagen} alt={productoVista.nombre}
                      className={imgVisible ? 'visible' : ''} style={{ opacity: imgVisible ? 1 : 0, transition: 'opacity 0.3s' }} />
                  ) : (
                    <div className="placeholder-producto" id="placeholderProducto">
                      <div className="icono-placeholder">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                          <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 12L7.5 8.5L12 13L16.5 8.5L21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"/>
                        </svg>
                      </div>
                      <p className="texto-placeholder">Haz clic en un producto para verlo aquí</p>
                    </div>
                  )}
                  <div className="overlay-producto"></div>
                </div>
                <div className="info-producto-destacado">
                  {!productoVista ? (
                    <div id="infoVacia" className="info-vacia">
                      <h4 className="titulo-vacio">¿Qué producto te gustaría ordenar?</h4>
                      <p className="descripcion-vacia">Explora nuestros productos en la galería de abajo y selecciona el que más te guste.</p>
                      <div className="indicador-flecha">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div id="infoProducto" className="info-completa">
                      <h4>{productoVista.nombre}</h4>
                      <div className="precio-producto-destacado"><span className="simbolo">$</span><span>{productoVista.precio}</span></div>
                      <p>{productoVista.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="galeria-productos">
                {PRODUCTOS_PEDIDO.map((prod, i) => (
                  <label
                    key={prod.id}
                    htmlFor={prod.id}
                    className={`miniatura-producto${productoSeleccionado === prod.value ? ' active' : ''}`}
                    style={{ opacity: 0, transform: 'translateY(20px)', animation: `fadeInUp 0.5s ${i * 0.1}s forwards`, cursor: 'pointer', display: 'block' }}
                  >
                    <input 
                      type="radio" 
                      id={prod.id} 
                      name="producto" 
                      value={prod.value}
                      checked={productoSeleccionado === prod.value} 
                      onChange={() => { setProductoSeleccionado(prod.value); seleccionarVista(prod); }} 
                    />
                    <div className="contenido-miniatura">
                      <div className="imagen-miniatura"><img src={prod.imagen} alt={prod.nombre} /></div>
                      <div className="info-miniatura">
                        <span className="nombre-mini">{prod.nombre.split(' ').slice(0,2).join(' ')}</span>
                        <span className="precio-mini">${prod.precio}</span>
                      </div>
                      <div className="indicador-check"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="seccion-datos-cliente">
            <h3 className="titulo-seccion-pedidos">Datos del Cliente</h3>
            <div className="fila-campos-pedido">
              <div className="grupo-campo-pedido">
                <label htmlFor="nombreCompleto">Nombre Completo <span className="campo-obligatorio-pedido">*</span></label>
                <input type="text" id="nombreCompleto" required placeholder="Tu nombre completo" value={form.nombreCompleto} onChange={e => cambiar('nombreCompleto', e.target.value)} />
              </div>
              <div className="grupo-campo-pedido">
                <label htmlFor="correoElectronico">Correo Electrónico <span className="campo-obligatorio-pedido">*</span></label>
                <input type="email" id="correoElectronico" required placeholder="ejemplo@correo.com" value={form.correoElectronico} onChange={e => cambiar('correoElectronico', e.target.value)} />
              </div>
            </div>
            <div className="grupo-campo-pedido">
              <label htmlFor="telefono">Teléfono <span className="campo-obligatorio-pedido">*</span></label>
              <input type="tel" id="telefono" required placeholder="+57 300 000 0000" value={form.telefono} onChange={e => cambiar('telefono', e.target.value)} />
            </div>
          </div>

          <div className="seccion-detalles-entrega">
            <h3 className="titulo-seccion-pedidos">Detalles de Entrega</h3>
            <div className="grupo-campo-pedido">
              <label htmlFor="nombreDestinatario">Nombre del Destinatario <span className="campo-obligatorio-pedido">*</span></label>
              <input type="text" id="nombreDestinatario" required placeholder="Nombre de la persona que recibirá el pedido" value={form.nombreDestinatario} onChange={e => cambiar('nombreDestinatario', e.target.value)} />
            </div>
          </div>

          <div className="seccion-personalizacion">
            <h3 className="titulo-seccion-pedidos">Personalización del Pedido</h3>
            <div className="grupo-campo-pedido">
              <label htmlFor="personalizacion">Detalles Adicionales</label>
              <textarea id="personalizacion" placeholder="Describe cualquier requerimiento especial, preferencias de color, tema, horario, instrucciones de entrega..." value={form.personalizacion} onChange={e => cambiar('personalizacion', e.target.value)}></textarea>
            </div>
            <div className="nota-personalizacion"><strong>Nota:</strong> Mientras más detalles nos proporciones, mejor podremos personalizar tu experiencia.</div>
          </div>

          <button type="submit" className="boton-enviar-pedido">
            <i className="fas fa-shopping-cart" style={{ marginRight: '10px' }}></i>
            Confirmar y Agregar al Carrito
          </button>
        </form>
      </div>
      <style>{`@keyframes fadeInUp { to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}