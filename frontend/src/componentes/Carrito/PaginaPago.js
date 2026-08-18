import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../contexto/CarritoContexto';
import { crearPedidoAPI } from '../../servicios/api';
import '../../estilos/pago.css';

const CART_KEY = 'productoCarrito';

const METODOS = {
  tarjeta:       'Tarjeta de Crédito/Débito',
  nequi:         'Nequi - Pago Móvil (312 245 7008)',
  daviplata:     'Daviplata - Billetera Digital (312 987 6543)',
  transferencia: 'Transferencia Bancaria - Bancolombia',
};

function formatearPrecio(p) { return `$${Math.round(p).toLocaleString('es-CO')}`; }

function obtenerCarritoLocal() {
  try { 
    const d = localStorage.getItem(CART_KEY); 
    if (!d) return []; 
    const p = JSON.parse(d); 
    return Array.isArray(p) ? p : [p]; 
  } catch { return []; }
}

function FormTarjeta() {
  return (
    <>
      <h3 className="titulo-form">Información de Tarjeta</h3>
      <div className="grupo-campo">
        <label htmlFor="tarjeta-numero">Número de Tarjeta <span className="requerido">*</span></label>
        <input id="tarjeta-numero" type="text" placeholder="1234 5678 9012 3456" maxLength={19} required />
      </div>
      <div className="grupo-campo">
        <label htmlFor="tarjeta-titular">Titular <span className="requerido">*</span></label>
        <input id="tarjeta-titular" type="text" placeholder="Nombre completo" required />
      </div>
      <div className="fila-campos">
        <div className="grupo-campo">
          <label htmlFor="tarjeta-expiracion">Expiración <span className="requerido">*</span></label>
          <input id="tarjeta-expiracion" type="text" placeholder="MM/AA" maxLength={5} required />
        </div>
        <div className="grupo-campo">
          <label htmlFor="tarjeta-cvv">CVV <span className="requerido">*</span></label>
          <input id="tarjeta-cvv" type="text" placeholder="123" maxLength={4} required />
        </div>
      </div>
    </>
  );
}

function FormNequi() {
  return (
    <>
      <h3 className="titulo-form">📱 Pago con Nequi</h3>
      <div className="info-pago-movil">
        <p>Envía el pago a: <strong>312 245 7008</strong></p>
        <p>Nombre: <strong>Communicating Design Lion</strong></p>
        <div className="grupo-campo" style={{marginTop:'15px'}}>
          <label htmlFor="nequi-numero">Tu número Nequi <span className="requerido">*</span></label>
          <input id="nequi-numero" type="tel" placeholder="+57 300 000 0000" required />
        </div>
        <div className="grupo-campo">
          <label htmlFor="nequi-referencia">Número de referencia <span className="requerido">*</span></label>
          <input id="nequi-referencia" type="text" placeholder="Comprobante de pago" required />
        </div>
      </div>
    </>
  );
}

function FormDaviplata() {
  return (
    <>
      <h3 className="titulo-form">💰 Pago con Daviplata</h3>
      <div className="info-pago-movil">
        <p>Envía el pago a: <strong>312 987 6543</strong></p>
        <p>Nombre: <strong>Communicating Design Lion</strong></p>
        <div className="grupo-campo" style={{marginTop:'15px'}}>
          <label htmlFor="daviplata-numero">Tu número Daviplata <span className="requerido">*</span></label>
          <input id="daviplata-numero" type="tel" placeholder="+57 300 000 0000" required />
        </div>
        <div className="grupo-campo">
          <label htmlFor="daviplata-referencia">Número de referencia <span className="requerido">*</span></label>
          <input id="daviplata-referencia" type="text" placeholder="Comprobante de pago" required />
        </div>
      </div>
    </>
  );
}

function FormTransferencia() {
  return (
    <>
      <h3 className="titulo-form">🏦 Transferencia Bancaria</h3>
      <div className="info-pago-movil">
        <p>Banco: <strong>Bancolombia</strong></p>
        <p>Tipo de cuenta: <strong>Ahorros</strong></p>
        <p>Número de cuenta: <strong>204-123456-78</strong></p>
        <p>Titular: <strong>Communicating Design Lion</strong></p>
        <div className="grupo-campo" style={{marginTop:'15px'}}>
          <label htmlFor="transferencia-referencia">Número de referencia <span className="requerido">*</span></label>
          <input id="transferencia-referencia" type="text" placeholder="Número de comprobante" required />
        </div>
        <div className="grupo-campo">
          <label htmlFor="transferencia-correo">Correo de confirmación <span className="requerido">*</span></label>
          <input id="transferencia-correo" type="email" placeholder="tu@correo.com" required />
        </div>
      </div>
    </>
  );
}

export default function PaginaPago() {
  const navigate = useNavigate();
  const { vaciarCarrito } = useCarrito();
  const [carritoLocal] = useState(obtenerCarritoLocal);
  const [metodo, setMetodo] = useState('tarjeta');

  useEffect(() => { if (!carritoLocal.length) navigate('/carrito'); }, [carritoLocal, navigate]);

  const subtotal = carritoLocal.reduce((s, i) => s + (Number(i.precio) || Number(i.precioTotal) || 0), 0);
  const iva = subtotal * 0.10;
  const total = subtotal + iva;

  const procesarPago = async () => {
    const inputs = document.querySelectorAll('.formulario-pago.activo input[required]');
    let valido = true;
    inputs.forEach(inp => {
      if (!inp.value.trim()) { valido = false; inp.style.borderColor = '#ff0040'; }
      else inp.style.borderColor = '';
    });
    if (!valido) { alert('⚠️ Por favor completa todos los campos requeridos'); return; }
    const resumen = carritoLocal.map(i => `• ${i.nombre || 'Producto'}: ${formatearPrecio(Number(i.precio) || Number(i.precioTotal) || 0)}`).join('\n');
    if (!window.confirm(`¿Confirmar pago?\n\n${resumen}\n\nTotal a pagar: ${formatearPrecio(total)}\nMétodo: ${METODOS[metodo]}\n\nSe procesará tu pago de forma segura.`)) return;
    
    // Guardar datos del pago
    localStorage.setItem('datosPago', JSON.stringify({ 
      metodoPago: metodo, 
      nombreMetodo: METODOS[metodo], 
      fecha: new Date().toISOString(), 
      total 
    }));
    
    // Guardar datos de la factura (carrito + entrega + pago) ANTES de vaciar
    const entrega = JSON.parse(localStorage.getItem('cdl_entrega_seleccionada') || 'null');
    localStorage.setItem('cdl_factura_datos', JSON.stringify({
      items: carritoLocal,
      subtotal, iva, total,
      entrega,
      pago: { metodo, nombreMetodo: METODOS[metodo] },
      fecha: new Date().toISOString(),
      numeroFactura: 'CDL-' + Date.now().toString().slice(-8)
    }));
    
    // Llamar a crear pedido API
    try {
      await crearPedidoAPI({
        direccionEnvio: entrega ? `${entrega.direccion}, ${entrega.municipio}` : 'No especificada',
        telefono: entrega?.telefono || '',
        notas: `Método de pago: ${METODOS[metodo]}`
      });
      // Vaciar carrito en el cliente/servidor
      vaciarCarrito();
      
      navigate('/carrito/factura');
    } catch (e) {
      alert("Error al procesar el pedido: " + e.message);
    }
  };

  const forms = { tarjeta: <FormTarjeta />, nequi: <FormNequi />, daviplata: <FormDaviplata />, transferencia: <FormTransferencia /> };

  return (
    <div className="pagina-pago">
      <header className="header-pago">
        <div className="contenedor-header">
          <div className="logo-header"><i className="fas fa-credit-card"></i><span>Communicating Design Lion - Pago</span></div>
          <div className="indicador-pasos-compra" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="paso-proceso completado"><span className="circulo-numero-paso">✓</span><span className="etiqueta-nombre-paso">Carrito</span></div>
            <div className="linea-separadora-paso completada"></div>
            <div className="paso-proceso completado"><span className="circulo-numero-paso">✓</span><span className="etiqueta-nombre-paso">Entrega</span></div>
            <div className="linea-separadora-paso completada"></div>
            <div className="paso-proceso activo"><span className="circulo-numero-paso">3</span><span className="etiqueta-nombre-paso">Pago</span></div>
          </div>
        </div>
      </header>

      <div className="contenedor-volver">
        <button type="button" className="boton-volver" onClick={() => navigate('/carrito/entrega')}>← Volver a entrega</button>
      </div>

      <main className="contenedor-pago">
        <section className="seccion-metodos">
          <h1 className="titulo-principal">💳 Métodos de Pago</h1>
          <div className="opciones-pago">
            {[
              { id:'tarjeta', icono:'💳', nombre:'Tarjeta', desc:'Crédito/Débito' },
              { id:'nequi', icono:'📱', nombre:'Nequi', desc:'Pago móvil' },
              { id:'daviplata', icono:'💰', nombre:'Daviplata', desc:'Billetera digital' },
              { id:'transferencia', icono:'🏦', nombre:'Transferencia', desc:'Bancaria' },
            ].map(m => (
              <button 
                type="button" 
                key={m.id} 
                className={`opcion-pago${metodo === m.id ? ' seleccionada' : ''}`} 
                onClick={() => setMetodo(m.id)}
              >
                <div className="icono-pago">{m.icono}</div>
                <div className="nombre-pago">{m.nombre}</div>
                <div className="descripcion-pago">{m.desc}</div>
              </button>
            ))}
          </div>

          <form className="formulario-pago activo" id={`form-${metodo}`} onSubmit={e => e.preventDefault()}>
            {forms[metodo]}
          </form>

          <button type="button" className="boton-pagar" onClick={procesarPago}>
            <span>🔒 Confirmar y Pagar {formatearPrecio(total)}</span>
          </button>
        </section>

        <aside className="resumen-pago">
          <h2 className="titulo-resumen-pago">Resumen del Pedido</h2>
          <div id="productosResumen">
            {carritoLocal.map((item, i) => (
              <div key={i} className="producto-item-resumen">
                <span className="producto-nombre-resumen">{item.nombre || 'Producto'}</span>
                <span className="producto-precio-resumen">{formatearPrecio(Number(item.precio) || Number(item.precioTotal) || 0)}</span>
              </div>
            ))}
          </div>
          <div className="linea-divisoria-pago"></div>
          <div className="fila-subtotal"><span>Subtotal</span><span id="subtotalPago">{formatearPrecio(subtotal)}</span></div>
          <div className="fila-subtotal"><span>IVA (10%)</span><span id="ivaPago">{formatearPrecio(iva)}</span></div>
          <div className="linea-divisoria-pago"></div>
          <div className="fila-total-pago"><span>Total</span><span id="totalPago">{formatearPrecio(total)}</span></div>
          <div className="seguridad-pago"><i className="fas fa-lock"></i> Pago 100% seguro y encriptado</div>
        </aside>
      </main>
    </div>
  );
}