import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginAPI } from '../../servicios/api';
import '../../estilos/autenticacion.css';

const MENSAJES = {
  compra:  '🛒 Para realizar tu compra necesitas iniciar sesión.',
  paquete: '📦 Para reservar un paquete necesitas iniciar sesión.',
  perfil:  '👤 Necesitas iniciar sesión para ver tu perfil.',
};

export default function PaginaLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const motivo = searchParams.get('motivo');

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState('');
  const [correoError, setCorreoError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !password) return;
    setCargando(true);
    setError('');
    try {
      await loginAPI(correo, password);
      navigate('/');
    } catch (err) {
      setCorreoError(true);
      setPassError(true);
      setError(err.message || 'Correo o contraseña incorrectos.');
      setTimeout(() => { setCorreoError(false); setPassError(false); setError(''); }, 3000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-autenticacion">

      {motivo && MENSAJES[motivo] && (
        <div className="aviso-login-motivo">{MENSAJES[motivo]}</div>
      )}

      <Link className="nav-logotipo" to="/">
                COMMUNICATING DESIGN <span>LION</span>
              </Link>

      <form id="formulario-inicio-sesion" onSubmit={handleSubmit}>

        <div className="auth-encabezado">
          <div className="auth-subtitulo">
            <span className="auth-punto"></span>
            Communicating Design Lion
            <span className="auth-punto"></span>
          </div>
          <h1 className="titulo-formulario">LOGIN</h1>
        </div>

        <nav className="barra-navegacion-pestanas">
          <Link to="/registro" className="pestana-navegacion">Registrarse</Link>
          <Link to="/login" className="pestana-navegacion"><ins>Iniciar Sesión</ins></Link>
        </nav>

        <div className="auth-divisor">
          <div className="auth-divisor-linea"></div>
          <span className="auth-divisor-texto">Accede a tu cuenta</span>
          <div className="auth-divisor-linea"></div>
        </div>

        <div className="campo-formulario">
          <label htmlFor="campo-correo">Correo electrónico</label>
          <div className="campo-formulario__contenedor-con-icono">
            <input type="email" id="campo-correo" placeholder="ejemplo@gmail.com" required value={correo}
              onChange={e => { setCorreo(e.target.value); setCorreoError(false); }}
              style={correoError ? { borderColor: 'rgba(255,8,68,0.6)' } : {}} />
            <span className="campo-formulario__icono">✉</span>
          </div>
        </div>

        <div className="campo-formulario">
          <label htmlFor="campo-contrasena">Contraseña</label>
          <div className="campo-formulario__contenedor-con-icono">
            <input type={mostrarPass ? 'text' : 'password'} id="campo-contrasena" placeholder="Tu contraseña" required value={password}
              onChange={e => { setPassword(e.target.value); setPassError(false); }}
              style={passError ? { borderColor: 'rgba(255,8,68,0.6)' } : {}} />
            <span className="campo-formulario__icono" onClick={() => setMostrarPass(p => !p)}>👁</span>
          </div>
        </div>

        <div className="opcion-mostrar-contrasena">
          <input type="checkbox" id="activar-visibilidad-contrasena" checked={mostrarPass} onChange={e => setMostrarPass(e.target.checked)} />
          <label htmlFor="activar-visibilidad-contrasena">Mostrar contraseña</label>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <div className="auth-link-inferior">
          ¿No tienes cuenta? <Link to="/registro">Regístrate gratis</Link>
        </div>

      </form>
    </div>
  );
}