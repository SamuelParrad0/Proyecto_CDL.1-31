import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CarritoProvider } from './contexto/CarritoContexto';
import PaginaInicio from './componentes/Inicio/PaginaInicio';
import PaginaServicios from './componentes/Inicio/PaginaServicios';
import PaginaPaquetes from './componentes/Inicio/PaginaPaquetes';
import PaginaGaleria from './componentes/Inicio/PaginaGaleria';
import PaginaProductos from './componentes/Inicio/PaginaProductos';
import PaginaFAQ from './componentes/Inicio/PaginaFAQ';
import PaginaOpiniones from './componentes/Inicio/PaginaOpiniones';
import PaginaCarrito from './componentes/Carrito/PaginaCarrito';
import PaginaEntrega from './componentes/Carrito/PaginaEntrega';
import PaginaPago from './componentes/Carrito/PaginaPago';
import PaginaFactura from './componentes/Carrito/PaginaFactura';
import PaginaCitas from './componentes/Citas/PaginaCitas';
import PaginaPedidos from './componentes/Pedidos/PaginaPedidos';
import PaginaLogin from './componentes/Autenticacion/PaginaLogin';
import PaginaRegistro from './componentes/Autenticacion/PaginaRegistro';
import PaginaPerfil from './componentes/Perfil/PaginaPerfil';
import PaginaAdmin from './componentes/Admin/PaginaAdmin';
import PaginaPersonalizado from './componentes/Personalizado/PaginaPersonalizado';

function App() {
  return (
    <CarritoProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/servicios" element={<PaginaServicios />} />
          <Route path="/paquetes" element={<PaginaPaquetes />} />
          <Route path="/galeria" element={<PaginaGaleria />} />
          <Route path="/productos" element={<PaginaProductos />} />
          <Route path="/faq" element={<PaginaFAQ />} />
          <Route path="/opiniones" element={<PaginaOpiniones />} />
          <Route path="/carrito" element={<PaginaCarrito />} />
          <Route path="/carrito/entrega" element={<PaginaEntrega />} />
          <Route path="/carrito/pago" element={<PaginaPago />} />
          <Route path="/carrito/factura" element={<PaginaFactura />} />
          <Route path="/citas" element={<PaginaCitas />} />
          <Route path="/pedidos" element={<PaginaPedidos />} />
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/registro" element={<PaginaRegistro />} />
          <Route path="/perfil" element={<PaginaPerfil />} />
          <Route path="/admin" element={<PaginaAdmin />} />
          <Route path="/personalizado" element={<PaginaPersonalizado />} />
        </Routes>
      </Router>
    </CarritoProvider>
  );
}

export default App;