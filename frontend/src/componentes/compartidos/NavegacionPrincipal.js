import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCarrito } from '../../contexto/CarritoContexto';
import { haySesionActiva } from '../../servicios/api';

export default function NavegacionPrincipal() {
  const [scrolled, setScrolled] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const { carrito } = useCarrito();
  const sesionActiva = haySesionActiva();
  const rutaPerfil = sesionActiva ? '/perfil' : '/login';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const cerrar = () => { if (menuMovilAbierto) setMenuMovilAbierto(false); };
    document.addEventListener('click', cerrar);
    return () => document.removeEventListener('click', cerrar);
  }, [menuMovilAbierto]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    const nuevo = !menuMovilAbierto;
    setMenuMovilAbierto(nuevo);
    document.body.style.overflow = nuevo ? 'hidden' : '';
  };

  const cerrarMenu = () => {
    setMenuMovilAbierto(false);
    document.body.style.overflow = '';
  };

  // Si hay sesión, el navbar va debajo de la barra de entrega (top: 36px)
  // Si no hay sesión, el navbar va arriba del todo (top: 0)
  const topNavbar = sesionActiva ? '36px' : '0px';
  const topMenuMovil = sesionActiva ? '100px' : '64px';

  return (
    <>
      <nav
        className={`navegacion-principal${scrolled ? ' scrolled' : ''}`}
        id="navegacionPrincipal"
        style={{ top: topNavbar }}
      >
        <Link className="nav-logotipo" to="/">
          COMMUNICATING DESIGN <span>LION</span>
        </Link>
        <ul className="nav-enlaces">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/servicios">Servicios</Link></li>
          <li><Link to="/paquetes">Paquetes</Link></li>
          <li><Link to="/galeria">Galería</Link></li>
          <li><Link to="/productos">Productos</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
          <li><Link to="/opiniones">Opiniones</Link></li>
        </ul>
        <div className="nav-acciones">
          <Link className="nav-boton-carrito" to="/carrito" id="botonCarrito">
            <i className="fas fa-shopping-cart"></i> Carrito
            <span className={`contadorCarrito${carrito.length > 0 ? ' visible' : ''}`} id="contadorCarrito">{carrito.length}</span>
          </Link>
          <Link className="nav-boton-perfil" to={rutaPerfil}>{sesionActiva ? 'Mi Perfil' : 'Iniciar Sesión'}</Link>
          <button className={`nav-boton-menu-movil${menuMovilAbierto ? ' open' : ''}`} id="botonMenuMovil" onClick={toggleMenu} aria-label="Menú">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div
        className={`menu-movil-desplegable${menuMovilAbierto ? ' open' : ''}`}
        id="menuMovilDesplegable"
        onClick={e => e.stopPropagation()}
        style={{ top: topMenuMovil }}
      >
        <Link to="/" onClick={cerrarMenu}>Inicio</Link>
        <Link to="/servicios" onClick={cerrarMenu}>Servicios</Link>
        <Link to="/paquetes" onClick={cerrarMenu}>Paquetes</Link>
        <Link to="/galeria" onClick={cerrarMenu}>Galería</Link>
        <Link to="/productos" onClick={cerrarMenu}>Productos</Link>
        <Link to="/faq" onClick={cerrarMenu}>FAQ</Link>
        <Link to="/opiniones" onClick={cerrarMenu}>Opiniones</Link>
        <div className="menu-movil-acciones">
          <Link className="nav-boton-carrito" to="/carrito" onClick={cerrarMenu}>
            <i className="fas fa-shopping-cart"></i> Carrito
          </Link>
          <Link className="nav-boton-perfil" to={rutaPerfil} onClick={cerrarMenu}>{sesionActiva ? 'Mi Perfil' : 'Iniciar Sesión'}</Link>
        </div>
      </div>
    </>
  );
}