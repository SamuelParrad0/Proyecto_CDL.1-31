import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registroAPI } from '../../servicios/api';
import '../../estilos/autenticacion.css';

export default function PaginaRegistro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre:'', apellidos:'', celular:'', correo:'', contrasena:'' });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const cambiar = (c, v) => setForm(f => ({ ...f, [c]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.correo || !form.contrasena) return;
    setCargando(true);
    setError('');
    try {
      await registroAPI({
        nombre: form.nombre,
        apellidos: form.apellidos,
        celular: form.celular,
        correo: form.correo,
        contraseña: form.contrasena
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrar. Intenta de nuevo.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-autenticacion">
      <form id="formulario-registro" onSubmit={handleSubmit}>

        <Link className="nav-logotipo" to="/">
                        COMMUNICATING DESIGN <span>LION</span>
                      </Link>

        <div className="auth-encabezado">
          <div className="auth-subtitulo">
            <span className="auth-punto"></span>
            Communicating Design Lion
            <span className="auth-punto"></span>
          </div>
          <h1 className="titulo-formulario">REGISTRO</h1>
        </div>

        <nav className="barra-navegacion-pestanas">
          <Link to="/registro" className="pestana-navegacion"><ins>Registrarse</ins></Link>
          <Link to="/login" className="pestana-navegacion">Iniciar Sesión</Link>
        </nav>

        <div className="auth-divisor">
          <div className="auth-divisor-linea"></div>
          <span className="auth-divisor-texto">Crea tu cuenta</span>
          <div className="auth-divisor-linea"></div>
        </div>

        <div className="auth-fila">
          <div className="campo-formulario">
            <label htmlFor="campo-nombre">Nombre</label>
            <div className="campo-formulario__contenedor-con-icono">
              <input type="text" id="campo-nombre" placeholder="Tu nombre" required value={form.nombre} onChange={e => cambiar('nombre', e.target.value)} />
              <span className="campo-formulario__icono">👤</span>
            </div>
          </div>
          <div className="campo-formulario">
            <label htmlFor="campo-apellidos">Apellidos</label>
            <div className="campo-formulario__contenedor-con-icono">
              <input type="text" id="campo-apellidos" placeholder="Tus apellidos" value={form.apellidos} onChange={e => cambiar('apellidos', e.target.value)} />
              <span className="campo-formulario__icono">👤</span>
            </div>
          </div>
        </div>

        <div className="campo-formulario">
          <label htmlFor="campo-celular">Celular</label>
          <div className="campo-formulario__contenedor-con-icono">
            <input type="tel" id="campo-celular" placeholder="+57 300 000 0000" required value={form.celular} onChange={e => cambiar('celular', e.target.value)} />
            <span className="campo-formulario__icono">📞</span>
          </div>
        </div>

        <div className="campo-formulario">
          <label htmlFor="campo-correo">Correo electrónico</label>
          <div className="campo-formulario__contenedor-con-icono">
            <input type="email" id="campo-correo" placeholder="ejemplo@gmail.com" required value={form.correo} onChange={e => cambiar('correo', e.target.value)} />
            <span className="campo-formulario__icono">✉</span>
          </div>
        </div>

        <div className="campo-formulario">
          <label htmlFor="campo-contrasena">Contraseña</label>
          <div className="campo-formulario__contenedor-con-icono">
            <input type={mostrarPass ? 'text' : 'password'} id="campo-contrasena" placeholder="Mínimo 6 caracteres" required value={form.contrasena} onChange={e => cambiar('contrasena', e.target.value)} />
            <span className="campo-formulario__icono" onClick={() => setMostrarPass(p => !p)}>👁</span>
          </div>
        </div>

        <div className="opcion-mostrar-contrasena">
          <input type="checkbox" id="activar-visibilidad-contrasena" checked={mostrarPass} onChange={e => setMostrarPass(e.target.checked)} />
          <label htmlFor="activar-visibilidad-contrasena">Mostrar contraseña</label>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>

        <div className="auth-link-inferior">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>

      </form>
    </div>
  );
}