import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../estilos/factura.css';

function formatearPrecio(p) { return `$${Math.round(p).toLocaleString('es-CO')}`; }

export default function PaginaFactura() {
  const navigate = useNavigate();
  
  const [datosFactura] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('cdl_factura_datos') || 'null'); 
    } catch { return null; }
  });
  
  const [datosPago] = useState(() => { 
    try { return JSON.parse(localStorage.getItem('datosPago') || 'null'); } catch { return null; } 
  });

  const [usuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch { return null; }
  });
  
  const [fecha] = useState(() => new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' }));

  useEffect(() => {
    if (!datosFactura || !datosFactura.items || !datosFactura.items.length) {
      navigate('/');
    }
  }, [datosFactura, navigate]);

  if (!datosFactura || !datosFactura.items || !datosFactura.items.length) return null;

  const carrito = datosFactura.items;
  const subtotal = datosFactura.subtotal || carrito.reduce((s, i) => s + (Number(i.precio) || Number(i.precioTotal) || 0), 0);
  const iva = datosFactura.iva || subtotal * 0.10;
  const total = datosFactura.total || subtotal + iva;
  const numeroFactura = datosFactura.numeroFactura || 'CDL-' + Date.now().toString().slice(-8);
  const primerItem = carrito[0];

  const nuevaCompra = () => {
    if (!window.confirm('¿Deseas realizar una nueva compra?\n\nVolverás a la página principal.')) return;
    localStorage.removeItem('productoCarrito');
    localStorage.removeItem('datosPago');
    localStorage.removeItem('cdl_factura_datos');
    localStorage.removeItem('cdl_entrega_seleccionada');
    localStorage.removeItem('cdl_clientes_carrito');
    navigate('/');
  };

  return (
    <div className="pagina-factura">
      <div className="mensaje-exito">
        <div className="icono-exito">✓</div>
        <h2 className="titulo-exito">¡Pedido Confirmado!</h2>
        <p className="descripcion-exito">Tu pedido ha sido procesado exitosamente</p>
      </div>

      <div className="contenedor-factura">
        <div className="sello-pagado">PAGADO</div>

        <div className="encabezado-factura">
          <div className="info-empresa">
            <div className="nombre-empresa-principal">Communicating Design Lion</div>
            <div className="datos-empresa">
              <p><i className="fas fa-map-marker-alt icono-dato"></i> Bogotá D.C., Colombia</p>
              <p><i className="fas fa-id-card icono-dato"></i> NIT: 1012355082-2</p>
              <p><i className="fas fa-envelope icono-dato"></i> c.designlion025@gmail.com</p>
              <p><i className="fas fa-phone icono-dato"></i> +57 313 274 1001</p>
            </div>
          </div>
          <div className="info-factura">
            <div className="titulo-factura-empresa">Factura #{numeroFactura}</div>
            <div className="fecha-factura"><i className="far fa-calendar-alt"></i> {fecha}</div>
            <div className="estado-pago">✓ Confirmado</div>
          </div>
        </div>

        <div className="seccion-cliente">
          <h3 className="titulo-cliente"><i className="fas fa-user"></i> Datos del Cliente</h3>
          <div id="infoClienteFactura">
            <div className="dato-cliente"><span className="etiqueta-cliente"><i className="fas fa-user"></i> Nombre:</span><span className="valor-cliente">{primerItem?.cliente?.nombreCompleto || (usuario ? `${usuario.Nombre} ${usuario.Apellidos || ''}`.trim() : 'N/A')}</span></div>
            <div className="dato-cliente"><span className="etiqueta-cliente"><i className="fas fa-envelope"></i> Correo:</span><span className="valor-cliente">{primerItem?.cliente?.correoElectronico || usuario?.Correo || 'N/A'}</span></div>
            <div className="dato-cliente"><span className="etiqueta-cliente"><i className="fas fa-phone"></i> Teléfono:</span><span className="valor-cliente">{primerItem?.cliente?.telefono || usuario?.Celular || 'N/A'}</span></div>
          </div>
        </div>

        {datosFactura.entrega && (
          <div className="seccion-cliente" style={{ marginTop: '1rem' }}>
            <h3 className="titulo-cliente"><i className="fas fa-truck"></i> Dirección de Entrega</h3>
            <div>
              <div className="dato-cliente"><span className="etiqueta-cliente"><i className="fas fa-map-marker-alt"></i> Dirección:</span><span className="valor-cliente">{datosFactura.entrega.direccion || 'N/A'}</span></div>
              {datosFactura.entrega.municipio && <div className="dato-cliente"><span className="etiqueta-cliente"><i className="fas fa-city"></i> Ciudad:</span><span className="valor-cliente">{datosFactura.entrega.municipio}</span></div>}
              {datosFactura.entrega.telefono && <div className="dato-cliente"><span className="etiqueta-cliente"><i className="fas fa-phone"></i> Teléfono:</span><span className="valor-cliente">{datosFactura.entrega.telefono}</span></div>}
            </div>
          </div>
        )}

        <div className="separador-seccion"></div>

        <h3 className="titulo-detalle-pedido"><i className="fas fa-box"></i> Detalle del Pedido</h3>
        <table className="tabla-productos">
          <thead>
            <tr><th style={{width:'60%'}}>Producto</th><th style={{textAlign:'right',width:'40%'}}>Precio</th></tr>
          </thead>
          <tbody id="itemsFactura">
            {carrito.map((item) => {
              const rowKey = `${item.id || item.productoId || item.nombre}-${item.precio || item.precioTotal}`;
              return (
                <tr key={rowKey}>
                  <td>
                    <div className="nombre-producto-tabla"><i className="fas fa-box"></i> {item.nombre || 'Producto'}</div>
                    {item.personalizacion && <div className="personalizacion-tabla"><i className="fas fa-star"></i> <strong>Personalización:</strong> {item.personalizacion}</div>}
                  </td>
                  <td style={{textAlign:'right',fontWeight:'bold',color:'#ff0040',fontSize:'1.1rem'}}>{formatearPrecio(Number(item.precio) || Number(item.precioTotal) || 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="seccion-totales">
          <div className="contenedor-totales">
            <div className="linea-total"><span>Subtotal</span><span id="subtotalFactura">{formatearPrecio(subtotal)}</span></div>
            <div className="linea-total"><span>IVA (10%)</span><span id="ivaFactura">{formatearPrecio(iva)}</span></div>
            <div className="linea-total linea-gran-total"><span>TOTAL</span><span id="totalFactura">{formatearPrecio(total)}</span></div>
          </div>
        </div>

        <div className="seccion-metodo-pago">
          <div className="fila-metodo-pago">
            <span><i className="fas fa-credit-card"></i> Método de Pago:</span>
            <span id="metodoPagoFactura">{datosPago?.nombreMetodo || datosFactura.pago?.nombreMetodo || 'No especificado'}</span>
          </div>
        </div>

        <div className="acciones-factura">
          <button type="button" className="boton-imprimir" onClick={() => window.print()}>
            <i className="fas fa-print"></i> Imprimir Factura
          </button>
          <button type="button" className="boton-nueva-compra" onClick={nuevaCompra}>
            <i className="fas fa-shopping-cart"></i> Nueva Compra
          </button>
        </div>

        <div className="pie-factura">
          <p>Gracias por confiar en Communicating Design Lion</p>
          <p>Para cualquier consulta contáctenos: +57 313 274 1001</p>
        </div>
      </div>
    </div>
  );
}