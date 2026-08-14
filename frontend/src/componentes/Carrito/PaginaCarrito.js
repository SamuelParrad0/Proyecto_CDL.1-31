import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../../contexto/CarritoContexto';
import '../../estilos/carrito.css';

function formatearPrecio(precio) {
  return `$${Math.round(precio).toLocaleString('es-CO')}`;
}

// Mapeo de nombres de producto a imágenes locales (fallback cuando la BD no tiene imagen)
const MAPA_IMAGENES_PRODUCTO = {
  'cajita corazón': '/Imagenes_Videos/Imagenes_Videos/Img-Productos/Cajita-corazon.png',
  'bolsa sorpresa': '/Imagenes_Videos/Imagenes_Videos/Img-Productos/Bolsa-Sorpresa.png',
  'caja multifotográfica': '/Imagenes_Videos/Imagenes_Videos/Img-Productos/Caja-multifotografia.png',
  'libro emoción': '/Imagenes_Videos/Imagenes_Videos/Img-Productos/Libro-emocion.png',
  'productos amor': '/Imagenes_Videos/Imagenes_Videos/Img-Productos/Productos-amor.png',
};

const obtenerImagenProducto = (producto) => {
  if (!producto) return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&q=80';
  if (producto.imagenUrl && !producto.imagenUrl.includes('/null')) return producto.imagenUrl;
  if (producto.Imagen_Producto) return producto.Imagen_Producto;
  if (producto.Imagen) return producto.Imagen;
  
  const nombreLower = (producto.Nombre_Producto || '').toLowerCase();
  for (const [clave, ruta] of Object.entries(MAPA_IMAGENES_PRODUCTO)) {
    if (nombreLower.includes(clave)) return ruta;
  }
  return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&q=80';
};

export default function PaginaCarrito() {
  const navigate = useNavigate();
  const [usuario] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch { return null; }
  });
  const { carrito, eliminarItem, actualizarCantidad, sincronizar, cargando, obtenerCarritoConClientes } = useCarrito();

  useEffect(() => {
    sincronizar();
  }, [sincronizar]);

  const carritoConClientes = obtenerCarritoConClientes();

  const handleCambioCantidad = (itemId, nuevaCantidad, stock) => {
    let cant = Number.Number.parseInt(nuevaCantidad);
    if (Number.isNaN(cant) || cant < 1) cant = 1;
    if (cant > stock) {
      alert(`Solo hay ${stock} unidades disponibles.`);
      cant = stock;
    }
    actualizarCantidad(itemId, cant);
  };

  const subtotal = carrito.reduce((s, item) => s + Number(item.Precio_Total || (item.producto?.Precio_Producto * item.Cantidad_Productos) || 0), 0);
  const iva = subtotal * 0.10;
  const total = subtotal + iva;

  const procederAlPago = () => {
    if (!carrito.length) { alert('⚠️ No hay productos en el carrito'); return; }
    
    // Guardar datos del carrito en localStorage para que Entrega/Pago/Factura los lean
    const resumenCarrito = carritoConClientes.map(item => ({
      id: item.Id_Carrito,
      productoId: item.Id_Producto || item.producto?.Id_Producto,
      nombre: item.producto?.Nombre_Producto || 'Producto',
      precio: Number(item.producto?.Precio_Producto || 0),
      cantidad: item.Cantidad_Productos || 1,
      precioTotal: Number(item.Precio_Total || 0),
      imagen: item.producto?.Imagen || item.producto?.Imagen_Producto || '',
      cliente: item.cliente || null,
      personalizacion: item.personalizacion || null,
    }));
    localStorage.setItem('productoCarrito', JSON.stringify(resumenCarrito));
    
    navigate('/carrito/entrega');
  };

  return (
    <div className="pagina-carrito">
      <header className="encabezado-principal">
        <div className="barra-navegacion-contenido">
          <div className="logo-nombre-marca">
            <i className="fas fa-folder"></i>
            <span>Communicating Design Lion</span>
          </div>
          <button className="boton-carrito-header" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <i className="fas fa-shopping-cart"></i>
            <span>Carrito</span>
            <span className="badge-cantidad-carrito" style={{ display: carrito.length ? 'flex' : 'none' }}>{carrito.length}</span>
          </button>
        </div>
      </header>

      <div className="zona-boton-regresar">
        <Link to="/" className="enlace-regresar-tienda" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          ← Continuar comprando
        </Link>
      </div>

      <main className="estructura-dos-columnas">
        <section className="columna-lista-productos">
          <div className="titulo-seccion-carrito">
            <i className="fas fa-shopping-cart"></i>
            <h1>Mi Carrito</h1>
          </div>
          <div id="listaProductosCarrito" className="contenedor-productos-renderizados">
            {cargando ? (
              <div className="aviso-carrito-vacio">
                <div className="emoji-carrito-vacio">⏳</div>
                <h3>Cargando carrito...</h3>
              </div>
            ) : !carrito.length ? (
              <div className="aviso-carrito-vacio">
                <div className="emoji-carrito-vacio">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p style={{ color: 'var(--texto-secundario)', margin: '10px 0' }}>Aún no has seleccionado ningún producto o paquete</p>
                <button onClick={() => navigate('/')}>Ir a Productos</button>
              </div>
            ) : (
              carritoConClientes.map((item) => (
                <div key={item.Id_Carrito} className="tarjeta-producto-carrito" style={{ marginBottom: '20px' }}>
                  <div className="imagen-miniatura-producto">
                    <img src={obtenerImagenProducto(item.producto)} alt={item.producto?.Nombre_Producto}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&q=80'; }} />
                  </div>
                  <div className="datos-texto-producto">
                    <div>
                      <h3 className="titulo-nombre-producto">{item.producto?.Nombre_Producto}</h3>
                      <div className="precio-unitario-producto">{formatearPrecio(item.producto?.Precio_Producto || 0)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                        <button 
                          onClick={() => {
                            if (item.Cantidad_Productos > 1) {
                              actualizarCantidad(item.Id_Carrito, item.Cantidad_Productos - 1);
                            } else {
                              eliminarItem(item.Id_Carrito);
                            }
                          }}
                          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', paddingBottom: '2px' }}
                        >-</button>
                        <input 
                          type="number"
                          value={item.Cantidad_Productos || 1}
                          min="1"
                          max={item.producto?.Stock || 1}
                          onChange={(e) => {
                            // Solo actualizamos el valor visualmente rápido, y enviamos el request onBlur o si presionan enter
                            // Pero como estamos usando context, la mejor opción es llamar a la API con un ligero debounce o onBlur.
                            // Para mantenerlo simple y reactivo, llamamos a la API directamente en onChange.
                            handleCambioCantidad(item.Id_Carrito, e.target.value, item.producto?.Stock || 1);
                          }}
                          style={{ 
                            width: '40px', 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#fff', 
                            fontSize: '1rem', 
                            fontWeight: 'bold', 
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                        <button 
                          disabled={(item.Cantidad_Productos || 1) >= (item.producto?.Stock || 1)}
                          onClick={() => actualizarCantidad(item.Id_Carrito, (item.Cantidad_Productos || 1) + 1)}
                          style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            color: '#fff', 
                            border: 'none', 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '4px', 
                            cursor: (item.Cantidad_Productos || 1) >= (item.producto?.Stock || 1) ? 'not-allowed' : 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '1.2rem', 
                            paddingBottom: '2px',
                            opacity: (item.Cantidad_Productos || 1) >= (item.producto?.Stock || 1) ? 0.3 : 1
                          }}
                        >+</button>
                      </div>
                    </div>
                    {(item.cliente || usuario) && (
                      <div className="bloque-info-cliente">
                        <div className="fila-campo-cliente"><span className="etiqueta-dato-cliente">Cliente:</span><span className="valor-dato-cliente">{item.cliente?.nombreCompleto || (usuario ? `${usuario.Nombre} ${usuario.Apellidos || ''}`.trim() : 'N/A')}</span></div>
                        <div className="fila-campo-cliente"><span className="etiqueta-dato-cliente">Teléfono:</span><span className="valor-dato-cliente">{item.cliente?.telefono || usuario?.Celular || 'N/A'}</span></div>
                        {(item.cliente?.correoElectronico || usuario?.Correo) && (
                          <div className="fila-campo-cliente"><span className="etiqueta-dato-cliente">Correo:</span><span className="valor-dato-cliente">{item.cliente?.correoElectronico || usuario?.Correo}</span></div>
                        )}
                        {item.cliente?.nombreDestinatario && (
                          <div className="fila-campo-cliente"><span className="etiqueta-dato-cliente">Destinatario:</span><span className="valor-dato-cliente">{item.cliente.nombreDestinatario}</span></div>
                        )}
                      </div>
                    )}
                    {item.personalizacion && (
                      <div className="bloque-texto-personalizacion"><strong>Personalización:</strong><br />{item.personalizacion}</div>
                    )}
                    <div style={{ marginTop: '15px' }}>
                      <button onClick={() => eliminarItem(item.Id_Carrito)} style={{ background: 'transparent', border: '1px solid rgba(255,8,68,0.4)', color: '#ff0844', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,8,68,0.15)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {carrito.length > 0 && (
          <aside className="panel-lateral-resumen">
            <h2 className="titulo-resumen-lateral">Resumen</h2>
            <div className="grupo-filas-totales">
              <div className="fila-detalle-precio"><span>Subtotal:</span><span>{formatearPrecio(subtotal)}</span></div>
              <div className="fila-detalle-precio"><span>IVA (10%):</span><span>{formatearPrecio(iva)}</span></div>
              <div className="fila-detalle-precio fila-precio-total"><span>Total:</span><span>{formatearPrecio(total)}</span></div>
            </div>
            <button className="boton-proceder-pago" onClick={procederAlPago}>Proceder al Pago</button>
          </aside>
        )}
      </main>
    </div>
  );
}
