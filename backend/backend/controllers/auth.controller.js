const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
const { normalizarRol } = require('../utils/roles');

// ==========================================
// REGISTRO DE USUARIO
// ==========================================
const registrar = async (req, res) => {
  try {
    const { nombre, apellidos, correo, contraseña, celular } = req.body;

    // Verificar si el correo ya existe
    const usuarioExistente = await Usuario.scope('withPassword').findOne({
      where: { Correo: correo }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Este correo ya está registrado'
      });
    }

    // Buscar rol "cliente"
    let rolCliente = await Rol.findOne({
      where: { Nombre_Rol: 'cliente' }
    });

    // Si no existe el rol, crearlo
    if (!rolCliente) {
      rolCliente = await Rol.create({ Nombre_Rol: 'cliente' });
    }

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      Nombre: nombre,
      Apellidos: apellidos || null,
      Correo: correo,
      Contraseña: contraseña,
      Celular: celular || null,
      Id_Rol: rolCliente.Id_Rol
    });

    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario.Id_Usuario, rol: rolCliente.Nombre_Rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado correctamente',
      token,
      usuario: {
        Id_Usuario: nuevoUsuario.Id_Usuario,
        Nombre: nuevoUsuario.Nombre,
        Apellidos: nuevoUsuario.Apellidos,
        Correo: nuevoUsuario.Correo,
        Celular: nuevoUsuario.Celular,
        rol: rolCliente.Nombre_Rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar el usuario',
      error: error.message
    });
  }
};

// ==========================================
// LOGIN
// ==========================================
const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await Usuario.scope('withPassword').findOne({
      where: { Correo: correo },
      include: {
        model: Rol,
        as: 'Rol',
        attributes: ['Nombre_Rol']
      }
    });

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Correo o contraseña incorrectos'
      });
    }

    // Comparar contraseña
    const passwordCorrecta = await usuario.compararPassword(password);

    if (!passwordCorrecta) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Correo o contraseña incorrectos'
      });
    }

    const nombreRol = normalizarRol(usuario.Rol ? usuario.Rol.Nombre_Rol : 'cliente');

    // Generar token
    const token = jwt.sign(
      { id: usuario.Id_Usuario, rol: nombreRol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      ok: true,
      mensaje: 'Login exitoso',
      token,
      usuario: {
        Id_Usuario: usuario.Id_Usuario,
        Nombre: usuario.Nombre,
        Apellidos: usuario.Apellidos,
        Correo: usuario.Correo,
        Celular: usuario.Celular,
        rol: nombreRol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// ==========================================
// PERFIL
// ==========================================
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuarioId, {
      include: {
        model: Rol,
        as: 'Rol',
        attributes: ['Nombre_Rol']
      }
    });

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      ok: true,
      usuario
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener el perfil',
      error: error.message
    });
  }
};

// ==========================================
// LISTAR USUARIOS
// ==========================================
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: {
        model: Rol,
        as: 'Rol',
        attributes: ['Nombre_Rol']
      }
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

// ==========================================
// OBTENER POR ID
// ==========================================
const obtenerUsuarioId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: {
        model: Rol,
        as: 'Rol',
        attributes: ['Nombre_Rol']
      }
    });

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener usuario' });
  }
};

// ==========================================
// EDITAR USUARIO (Admin)
// ==========================================
const editarUsuarioAdmin = async (req, res) => {
  try {
    const { nombre, apellidos, celular, correo, contraseña } = req.body;
    const usuario = await Usuario.scope('withPassword').findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    if (nombre) usuario.Nombre = nombre;
    if (apellidos) usuario.Apellidos = apellidos;
    if (celular) usuario.Celular = celular;
    if (correo && correo !== usuario.Correo) {
      const existe = await Usuario.findOne({ where: { Correo: correo } });
      if (existe) {
        return res.status(400).json({ ok: false, mensaje: 'El correo ya está en uso' });
      }
      usuario.Correo = correo;
    }
    if (contraseña) {
      usuario.Contraseña = contraseña;
    }

    await usuario.save();
    res.json({ ok: true, mensaje: 'Usuario editado correctamente', usuario: usuario.toJSON() });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al editar usuario' });
  }
};

// ==========================================
// ACTIVAR / DESACTIVAR USUARIO (Admin)
// ==========================================
const toggleUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    usuario.Activo = !usuario.Activo;
    await usuario.save();

    res.json({ 
      ok: true, 
      mensaje: `Usuario ${usuario.Activo ? 'activado' : 'desactivado'} correctamente`,
      usuario 
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cambiar estado del usuario' });
  }
};

// ==========================================
// ELIMINAR
// ==========================================
const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    const { Personalizado, ReservaPaquete, Carrito, Direccion, Pedido, DetallePedido } = require('../models');
    const id = req.params.id;

    // Eliminar datos relacionados primero
    await Carrito.destroy({ where: { Id_Usuario: id } });
    await Direccion.destroy({ where: { Id_Usuario: id } });
    await Personalizado.destroy({ where: { Id_Usuario: id } });
    await ReservaPaquete.destroy({ where: { Id_Usuario: id } });

    // Pedidos — primero detalles, luego pedidos
    const pedidos = await Pedido.findAll({ where: { usuarioId: id } });
    for (const pedido of pedidos) {
      await DetallePedido.destroy({ where: { pedidoId: pedido.id } });
    }
    await Pedido.destroy({ where: { usuarioId: id } });

    await usuario.destroy();

    res.json({ ok: true, mensaje: 'Usuario eliminado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar usuario' });
  }
};

// ==========================================
// ACTUALIZAR PERFIL
// ==========================================
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellidos, correo, celular, passwordActual, passwordNuevo } = req.body;
    const usuario = await Usuario.scope('withPassword').findByPk(req.usuarioId);

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    // Si intenta cambiar el correo, verificar que no esté en uso
    if (correo && correo !== usuario.Correo) {
      const existe = await Usuario.findOne({ where: { Correo: correo } });
      if (existe) {
        return res.status(400).json({ ok: false, mensaje: 'El correo ya está en uso' });
      }
      usuario.Correo = correo;
    }

    if (nombre) usuario.Nombre = nombre;
    if (apellidos) usuario.Apellidos = apellidos;
    if (celular) usuario.Celular = celular;

    // Si intenta cambiar la contraseña
    if (passwordNuevo) {
      if (!passwordActual) {
        return res.status(400).json({ ok: false, mensaje: 'Debes proporcionar la contraseña actual' });
      }
      const esCorrecta = await usuario.compararPassword(passwordActual);
      if (!esCorrecta) {
        return res.status(401).json({ ok: false, mensaje: 'La contraseña actual es incorrecta' });
      }
      usuario.Contraseña = passwordNuevo;
    }

    await usuario.save();

    res.json({
      ok: true,
      mensaje: 'Perfil actualizado correctamente',
      usuario: {
        Id_Usuario: usuario.Id_Usuario,
        Nombre: usuario.Nombre,
        Apellidos: usuario.Apellidos,
        Correo: usuario.Correo,
        Celular: usuario.Celular
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar el perfil' });
  }
};

// ==========================================
// REGISTRO DE ADMINISTRADOR (OCULTO)
// ==========================================
const registrarAdmin = async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    
    // Validar clave maestra
    if (!adminKey || adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({
        ok: false,
        mensaje: 'Acceso denegado: Clave de administración incorrecta o ausente'
      });
    }

    const { nombre, apellidos, correo, contraseña, celular, rol } = req.body;

    // Verificar si el correo ya existe
    const usuarioExistente = await Usuario.scope('withPassword').findOne({
      where: { Correo: correo }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Este correo ya está registrado'
      });
    }

    // Determinar qué rol asignar (si no envían, por defecto es admin)
    const nombreRolAsignar = rol || 'admin';

    // Buscar rol deseado
    let rolAsignar = await Rol.findOne({
      where: { Nombre_Rol: nombreRolAsignar }
    });

    // Si no existe el rol, crearlo
    if (!rolAsignar) {
      if (nombreRolAsignar === 'admin') {
        rolAsignar = await Rol.create({ Id_Rol: 1, Nombre_Rol: 'admin' });
      } else {
        rolAsignar = await Rol.create({ Nombre_Rol: nombreRolAsignar });
      }
    }

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      Nombre: nombre,
      Apellidos: apellidos || null,
      Correo: correo,
      Contraseña: contraseña,
      Celular: celular || null,
      Id_Rol: rolAsignar.Id_Rol
    });

    res.status(201).json({
      ok: true,
      mensaje: `Usuario registrado correctamente como ${nombreRolAsignar}`,
      usuario: {
        Id_Usuario: nuevoUsuario.Id_Usuario,
        Nombre: nuevoUsuario.Nombre,
        Correo: nuevoUsuario.Correo,
        rol: nombreRolAsignar
      }
    });

  } catch (error) {
    console.error('Error en registro admin:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al registrar el administrador',
      error: error.message
    });
  }
};

// ==========================================
// CAMBIAR ROL (Admin)
// ==========================================
const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoRol } = req.body; // 'admin', 'cliente' o 'auxiliar'

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

    const rol = await Rol.findOne({ where: { Nombre_Rol: nuevoRol } });
    if (!rol) return res.status(400).json({ ok: false, mensaje: 'Rol no válido' });

    usuario.Id_Rol = rol.Id_Rol;
    await usuario.save();

    res.json({ ok: true, mensaje: `Rol cambiado a ${nuevoRol}` });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cambiar rol' });
  }
};

module.exports = {
  registrar,
  registrarAdmin,
  login,
  obtenerPerfil,
  listarUsuarios,
  obtenerUsuarioId,
  editarUsuarioAdmin,
  toggleUsuario,
  eliminarUsuario,
  actualizarPerfil,
  cambiarRol
};