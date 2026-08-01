import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavegacionPrincipal from '../compartidos/NavegacionPrincipal';
import BarraEntrega from '../compartidos/BarraEntrega';
import RedesSocialesFlotantes from '../compartidos/RedesSocialesFlotantes';
import { useToast } from '../compartidos/useToast';
import { useScrollReveal } from '../compartidos/useScrollReveal';
import { useCarrito } from '../../contexto/CarritoContexto';
import { obtenerProductosAPI, obtenerCategoriasAPI } from '../../servicios/api';

// Mapeo de nombres de producto a imágenes locales (fallback cuando la BD no tiene imagen)
const MAPA_IMAGENES_PRODUCTO = {
  'cajita corazón': 'Imagenes_Videos/Imagenes_Videos/Img-Productos/Cajita-corazon.png',
  'bolsa sorpresa': 'Imagenes_Videos/Imagenes_Videos/Img-Productos/Bolsa-Sorpresa.png',
  'caja multifotográfica': 'Imagenes_Videos/Imagenes_Videos/Img-Productos/Caja-multifotografia.png',
  'libro emoción': 'Imagenes_Videos/Imagenes_Videos/Img-Productos/Libro-emocion.png',
  'productos amor': 'Imagenes_Videos/Imagenes_Videos/Img-Productos/Productos-amor.png',
};

const obtenerImagenProducto = (producto) => {
  // 1. Si el backend devuelve una URL válida, usarla
  if (producto.imagenUrl && !producto.imagenUrl.includes('/null')) return producto.imagenUrl;
  // 2. Si tiene Imagen_Producto con ruta, usarla
  if (producto.Imagen_Producto) return producto.Imagen_Producto;
  if (producto.Imagen) return producto.Imagen;
  // 3. Buscar por nombre en el mapa local
  const nombreLower = (producto.Nombre_Producto || '').toLowerCase();
  for (const [clave, ruta] of Object.entries(MAPA_IMAGENES_PRODUCTO)) {
    if (nombreLower.includes(clave)) return ruta;
  }
  // 4. Fallback genérico
  return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&q=80';
};

export default function PaginaProductos() {
  const { toastMensaje, toastVisible, mostrarToast } = useToast();
  const { agregarItem } = useCarrito();
  const navigate = useNavigate();
  useScrollReveal();

  const [productosAPI, setProductosAPI] = useState([]);
  const [categoriasAPI, setCategoriasAPI] = useState([]);
  const [cargandoTienda, setCargandoTienda] = useState(true);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [productoActivo, setProductoActivo] = useState(null);
  const [indiceImagenProducto, setIndiceImagenProducto] = useState(0);
  const [modalFormularioPedido, setModalFormularioPedido] = useState(false);
  const [productoPedido, setProductoPedido] = useState(null);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resProd, resCat] = await Promise.all([obtenerProductosAPI(), obtenerCategoriasAPI()]);
        setProductosAPI(resProd);
        setCategoriasAPI(resCat);
      } catch (e) { console.error(e); }
      finally { setCargandoTienda(false); }
    };
    cargar();
  }, []);

  const abrirModalProducto = (id) => {
    const producto = productosAPI.find(p => p.Id_Producto === id);
    if (!producto) return;
    setProductoActivo({ Id_Producto: producto.Id_Producto, nombre: producto.Nombre_Producto, precio: producto.Precio_Producto, imagenes: [obtenerImagenProducto(producto), ...(producto.Imagenes_Adicionales || [])].filter(Boolean), Stock: producto.Stock });
    setIndiceImagenProducto(0);
    setModalProductoAbierto(true);
    document.body.style.overflow = 'hidden';
  };

  const cerrarModalProducto = () => { setModalProductoAbierto(false); document.body.style.overflow = ''; setProductoActivo(null); };
  const navImagenProducto = (d) => { if (!productoActivo) return; setIndiceImagenProducto(prev => (prev + d + productoActivo.imagenes.length) % productoActivo.imagenes.length); };

  const pedirProductoDirecto = async (id) => {
    const prod = productosAPI.find(p => p.Id_Producto === id);
    if (!prod) return;
    
    setEnviandoPedido(true);
    try {
      const exito = await agregarItem(prod.Id_Producto, 1, {});
      if (exito) { 
        cerrarModalProducto();
        mostrarToast('✅ Producto agregado al carrito'); 
        setTimeout(() => navigate('/carrito'), 600); 
      }
    } catch { 
      mostrarToast('⚠️ Error al agregar al carrito'); 
    } finally { 
      setEnviandoPedido(false); 
    }
  };

  return (
    <div>
      <BarraEntrega mostrarToast={mostrarToast} />
      <NavegacionPrincipal />

      <section className="seccion-productos seccion-espaciado" style={{ paddingTop: '120px' }}>
        <div className="contenedor">
          <div className="encabezado-seccion animar-entrada" style={{ marginBottom: '2rem' }}>
            <h2 className="titulo-seccion">NUESTROS <span>PRODUCTOS</span></h2>
          </div>

          {/* Barra de Búsqueda y Filtro */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder="Buscar producto por nombre..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-2)',
                color: 'var(--text-primary)',
                minWidth: '280px',
                flex: '1 1 300px',
                fontFamily: "'DM Sans', sans-serif"
              }}
            />
            <select 
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-2)',
                color: 'var(--text-primary)',
                minWidth: '200px',
                flex: '0 1 250px',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer'
              }}
            >
              <option value="todas">Todas las categorías</option>
              {categoriasAPI.filter(cat => cat.Activo == 1 || cat.Activo === true || cat.Activo === '1').map(cat => (
                <option key={cat.Id_Categoria} value={cat.Id_Categoria}>
                  {cat.Nombre_Categoria}
                </option>
              ))}
            </select>
          </div>

          {cargandoTienda ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem 0' }}>Cargando catálogo...</div>
          ) : (
            categoriasAPI.filter(cat => cat.Activo == 1 || cat.Activo === true || cat.Activo === '1')
            .filter(cat => categoriaFiltro === 'todas' || categoriaFiltro == cat.Id_Categoria)
            .map((cat) => {
              const productosDeCat = productosAPI.filter(p => p.Id_Categoria == cat.Id_Categoria && (p.Activo == 1 || p.Activo === true || p.Activo === '1'))
                                                 .filter(p => p.Nombre_Producto.toLowerCase().includes(busqueda.toLowerCase()));
              if (productosDeCat.length === 0) return null;
              return (
                <div key={cat.Id_Categoria} className="categoria-grupo" style={{ marginBottom: '6rem' }}>
                  <div className="encabezado-categoria animar-entrada" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <span className="etiqueta-seccion">{cat.Nombre_Categoria}</span>
                    <p className="subtitulo-seccion" style={{ marginTop: '0.5rem' }}>{cat.Descripcion_Categoria}</p>
                  </div>
                  <div className="productos-cuadricula">
                    {productosDeCat.map(p => (
                      <div key={p.Id_Producto} className="tarjeta-producto animar-entrada">
                        <div className="producto-imagen-contenedor" onClick={() => p.Stock > 0 && abrirModalProducto(p.Id_Producto)}>
                          <img className="producto-imagen" src={obtenerImagenProducto(p)} alt={p.Nombre_Producto} loading="lazy" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&q=80'; }} />
                          <div className="producto-imagen-overlay"></div>
                          {p.Stock <= 0 ? (
                            <div className="producto-precio-etiqueta" style={{ background: '#ff0844' }}><span className="producto-precio-monto">AGOTADO</span></div>
                          ) : (
                            <div className="producto-precio-etiqueta"><span className="producto-precio-monto">${Number(p.Precio_Producto).toLocaleString('es-CO')}</span></div>
                          )}
                        </div>
                        <div className="producto-informacion">
                          <div className="producto-nombre">{p.Nombre_Producto}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Disponible:</span>
                            <span style={{ fontWeight: 700, color: p.Stock <= 0 ? '#ff0844' : p.Stock <= 5 ? '#f59e0b' : '#22c55e', background: p.Stock <= 0 ? 'rgba(255,8,68,0.1)' : p.Stock <= 5 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem' }}>
                              {p.Stock <= 0 ? 'Agotado' : p.Stock <= 5 ? `¡Últimas ${p.Stock} uds!` : `${p.Stock} uds`}
                            </span>
                          </div>
                          <button className="producto-boton-agregar" style={{ width: '100%', borderRadius: '50px', opacity: p.Stock <= 0 ? 0.5 : 1, cursor: p.Stock <= 0 ? 'not-allowed' : 'pointer' }} onClick={(e) => { e.stopPropagation(); pedirProductoDirecto(p.Id_Producto); }} disabled={enviandoPedido || p.Stock <= 0}>
                            {p.Stock <= 0 ? '🚫 Agotado' : <><i className="fas fa-shopping-cart"></i> Agregar al Carrito</>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modal Producto */}
      <div className={`modal-producto-fondo${modalProductoAbierto ? ' active' : ''}`}>
        <div className="modal-producto-caja">
          <button className="modal-boton-cerrar" onClick={cerrarModalProducto}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
          {productoActivo && (
            <div className="modal-disposicion">
              <div className="modal-galeria">
                <img className="modal-imagen-principal" src={productoActivo.imagenes[indiceImagenProducto]} alt={productoActivo.nombre} />
                <button className="modal-boton-navegacion prev" onClick={() => navImagenProducto(-1)}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg></button>
                <button className="modal-boton-navegacion next" onClick={() => navImagenProducto(1)}><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg></button>
                <div className="modal-contador-imagenes">{indiceImagenProducto + 1} / {productoActivo.imagenes.length}</div>
              </div>
              <div className="modal-detalles">
                <div>
                  <div className="modal-nombre-producto">{productoActivo.nombre}</div>
                  <div className="modal-precio-producto">${productoActivo.precio.toLocaleString('es-CO')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stock:</span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: productoActivo.Stock <= 0 ? '#ff0844' : productoActivo.Stock <= 5 ? '#f59e0b' : '#22c55e', background: productoActivo.Stock <= 0 ? 'rgba(255,8,68,0.1)' : productoActivo.Stock <= 5 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', padding: '3px 12px', borderRadius: '20px' }}>
                      {productoActivo.Stock <= 0 ? '🚫 Agotado' : productoActivo.Stock <= 5 ? `⚠️ ¡Últimas ${productoActivo.Stock} unidades!` : `✅ ${productoActivo.Stock} disponibles`}
                    </span>
                  </div>
                  <div className="modal-miniaturas">
                    {productoActivo.imagenes.map((img, i) => (
                      <div key={i} className={`modal-miniatura${i === indiceImagenProducto ? ' active' : ''}`} onClick={() => setIndiceImagenProducto(i)}><img src={img} alt="" /></div>
                    ))}
                  </div>
                </div>
                <div className="modal-grupo-botones">
                  <button className="modal-boton-pedir" style={{ opacity: productoActivo.Stock <= 0 ? 0.5 : 1, cursor: productoActivo.Stock <= 0 ? 'not-allowed' : 'pointer' }} onClick={() => pedirProductoDirecto(productoActivo.Id_Producto)} disabled={enviandoPedido || productoActivo.Stock <= 0}>
                    {productoActivo.Stock <= 0 ? '🚫 Agotado' : <><i className="fas fa-shopping-cart"></i> Agregar al Carrito</>}
                  </button>
                </div>
              </div>
            </div>
          )}
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