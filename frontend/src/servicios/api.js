const API_URL = 'http://localhost:5000/api';

const getHeaders = (isAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (isAuth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    throw new Error(data.mensaje || 'Error en la petición');
  }
  return data;
};

const validarId = (id) => {
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    throw new Error('ID inválido');
  }
  return idNum;
};

// ==========================================
// AUTENTICACIÓN Y PERFIL
// ==========================================
export async function loginAPI(correo, password) {
  const creds = typeof correo === 'object' ? correo : { correo, password };
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(creds)
  });
  const data = await handleResponse(response);
  if (data.token && data.usuario) {
    localStorage.removeItem('cdl_direccion');
    localStorage.removeItem('cdl_dirs_entrega');
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    try {
      const resDirs = await fetch(`${API_URL}/direcciones`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` }
      });
      const dataDirs = await resDirs.json();
      
      let dirs = [];
      if (Array.isArray(dataDirs)) {
        dirs = dataDirs;
      } else if (Array.isArray(dataDirs.direcciones)) {
        dirs = dataDirs.direcciones;
      }

      if (dirs.length > 0) {
        const primera = dirs[0];
        localStorage.setItem('cdl_direccion', JSON.stringify({
          nombre:       primera.Nombre_Completo || '',
          direccion:    primera.Direccion || '',
          departamento: primera.Departamento || '',
          municipio:    primera.Municipio_Localidad || '',
          barrio:       primera.Barrio || '',
          apto:         primera.Apart_Casa || '',
          telefono:     primera.Telefono || '',
          indicaciones: primera.Indicaciones || '',
          tipo:         primera.Residencia_Laboral || 'residencial'
        }));
      }
    } catch (e) {
      console.error('Error al cargar dirección:', e);
    }
  }
  return data;
}

export async function registroAPI(datos) {
  const response = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });
  const data = await handleResponse(response);
  if (data.token && data.usuario) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
  }
  return data;
}

export const registrarAPI = registroAPI;

export const getUsuarioLocal = () => {
  const u = localStorage.getItem('usuario');
  try {
    return u ? JSON.parse(u) : null;
  } catch (e) {
    console.error('Error parseando usuario local:', e);
    localStorage.removeItem('usuario');
    return null;
  }
};

export const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('cdl_direccion');
  localStorage.removeItem('cdl_dirs_entrega');
};

export const haySesionActiva = () => {
  return !!localStorage.getItem('token');
};

export async function obtenerPerfilAPI() {
  const response = await fetch(`${API_URL}/auth/perfil`, {
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function actualizarPerfilAPI(datos) {
  const response = await fetch(`${API_URL}/auth/perfil`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

// ==========================================
// PRODUCTOS Y CATEGORÍAS
// ==========================================
export async function obtenerProductosAPI(categoriaId = null) {
  const url = categoriaId
    ? `${API_URL}/productos/categoria/${validarId(categoriaId)}`
    : `${API_URL}/productos`;
  const response = await fetch(url);
  return handleResponse(response);
}

export async function listarProductosAdminAPI() {
  const response = await fetch(`${API_URL}/productos/admin/todos`, {
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function obtenerProductoPorIdAPI(id) {
  const response = await fetch(`${API_URL}/productos/${validarId(id)}`);
  return handleResponse(response);
}

export async function obtenerCategoriasAPI() {
  const response = await fetch(`${API_URL}/categorias`);
  return handleResponse(response);
}

export async function listarCategoriasAdminAPI() {
  const response = await fetch(`${API_URL}/categorias/admin/todas`, {
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

// ==========================================
// PAQUETES
// ==========================================
export async function obtenerPaquetesAPI() {
  const response = await fetch(`${API_URL}/paquetes`);
  return handleResponse(response);
}

// ==========================================
// CITAS Y RESERVAS
// ==========================================
export async function crearReservaAPI(datos) {
  const response = await fetch(`${API_URL}/citas`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function obtenerMisReservasAPI() {
  const response = await fetch(`${API_URL}/citas`, {
    headers: getHeaders(true)
  });
  const data = await handleResponse(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.citas)) return data.citas;
  return [];
}

export async function cancelarReservaAPI(id) {
  const response = await fetch(`${API_URL}/citas/${validarId(id)}/cancelar`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function cancelarPedidoAPI(id) {
  const response = await fetch(`${API_URL}/pedidos/${validarId(id)}/cancelar`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function cancelarPersonalizadoAPI(id) {
  const response = await fetch(`${API_URL}/personalizado/${validarId(id)}/cancelar`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

// ==========================================
// PERSONALIZADO
// ==========================================
export async function crearPersonalizadoAPI(datos) {
  const response = await fetch(`${API_URL}/personalizado`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function obtenerMisSolicitudesAPI() {
  const response = await fetch(`${API_URL}/personalizado`, {
    headers: getHeaders(true)
  });
  const data = await handleResponse(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.solicitudes)) return data.solicitudes;
  return [];
}

export async function obtenerMisPedidosAPI() {
  const response = await fetch(`${API_URL}/pedidos`, {
    headers: getHeaders(true)
  });
  const data = await handleResponse(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.pedidos)) return data.pedidos;
  return [];
}

export async function crearPedidoAPI(datos) {
  const response = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

// ==========================================
// CARRITO
// ==========================================
export async function obtenerCarritoAPI() {
  const response = await fetch(`${API_URL}/carrito`, {
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function agregarAlCarritoAPI(datos) {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function eliminarDelCarritoAPI(id) {
  const response = await fetch(`${API_URL}/carrito/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function actualizarCantidadCarritoAPI(id, cantidad) {
  const response = await fetch(`${API_URL}/carrito/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ cantidad })
  });
  return handleResponse(response);
}

export async function vaciarCarritoAPI() {
  const response = await fetch(`${API_URL}/carrito`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

// ==========================================
// DIRECCIONES
// ==========================================
export async function obtenerDireccionesAPI() {
  const response = await fetch(`${API_URL}/direcciones`, {
    headers: getHeaders(true)
  });
  const data = await handleResponse(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.direcciones)) return data.direcciones;
  return [];
}

export async function crearDireccionAPI(datos) {
  const payload = {
    nombreCompleto: datos.nombre || datos.nombreCompleto,
    direccion:      datos.direccion,
    departamento:   datos.departamento,
    municipio:      datos.municipio,
    barrio:         datos.barrio,
    apto:           datos.apto,
    telefono:       datos.telefono,
    indicaciones:   datos.indicaciones || '',
    tipo:           datos.tipo || 'residencial'
  };

  const response = await fetch(`${API_URL}/direcciones`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function eliminarDireccionAPI(id) {
  const response = await fetch(`${API_URL}/direcciones/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarDireccionAPI(id, datos) {
  const payload = {
    nombreCompleto: datos.nombre || datos.nombreCompleto,
    direccion:      datos.direccion,
    departamento:   datos.departamento,
    municipio:      datos.municipio,
    barrio:         datos.barrio,
    apto:           datos.apto,
    telefono:       datos.telefono,
    indicaciones:   datos.indicaciones || '',
    tipo:           datos.tipo || 'residencial'
  };
  const response = await fetch(`${API_URL}/direcciones/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

// ==========================================
// ADMINISTRACIÓN (Rutas Protegidas)
// ==========================================

// --- Usuarios ---
export async function listarUsuariosAPI() {
  const response = await fetch(`${API_URL}/auth/usuarios`, {
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarUsuarioAPI(id) {
  const response = await fetch(`${API_URL}/auth/usuarios/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function actualizarRolAPI(id, nuevoRol) {
  const response = await fetch(`${API_URL}/auth/admin/${validarId(id)}/rol`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ nuevoRol })
  });
  return handleResponse(response);
}

export async function toggleUsuarioAPI(id) {
  const response = await fetch(`${API_URL}/auth/usuarios/${validarId(id)}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarUsuarioAPI(id, datos) {
  const response = await fetch(`${API_URL}/auth/usuarios/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

// --- Productos Admin ---
export async function crearProductoAPI(datos) {
  const response = await fetch(`${API_URL}/productos/admin`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function actualizarProductoAPI(id, datos) {
  const response = await fetch(`${API_URL}/productos/admin/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function toggleProductoAPI(id) {
  const response = await fetch(`${API_URL}/productos/admin/${validarId(id)}/activar`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarProductoAPI(id) {
  const response = await fetch(`${API_URL}/productos/admin/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

// --- Categorías Admin ---
export async function crearCategoriaAPI(datos) {
  const response = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function actualizarCategoriaAPI(id, datos) {
  const response = await fetch(`${API_URL}/categorias/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function eliminarCategoriaAPI(id) {
  const response = await fetch(`${API_URL}/categorias/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function toggleCategoriaAPI(id) {
  const response = await fetch(`${API_URL}/categorias/${validarId(id)}/activar`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

// --- Paquetes Admin ---
export async function crearPaqueteAPI(datos) {
  const response = await fetch(`${API_URL}/paquetes/admin`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function actualizarPaqueteAPI(id, datos) {
  const response = await fetch(`${API_URL}/paquetes/admin/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function eliminarPaqueteAPI(id) {
  const response = await fetch(`${API_URL}/paquetes/admin/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function togglePaqueteAPI(id) {
  const response = await fetch(`${API_URL}/paquetes/admin/${validarId(id)}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

// --- Solicitudes y Opiniones ---
export async function obtenerTodasLasSolicitudesAPI(tipo = 'personalizado') {
  let path = 'personalizado/admin/todas';
  if (tipo === 'productos') path = 'pedidos/admin/todos';
  if (tipo === 'paquetes') path = 'citas/admin/todas';

  const response = await fetch(`${API_URL}/${path}`, {
    headers: getHeaders(true)
  });
  const data = await handleResponse(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.solicitudes)) return data.solicitudes;
  if (Array.isArray(data.citas)) return data.citas;
  if (Array.isArray(data.pedidos)) return data.pedidos;
  if (Array.isArray(data.reservas)) return data.reservas;
  return [];
}

export async function actualizarEstadoSolicitudAPI(tipo, id, estado) {
  const idValidado = validarId(id);
  let path = `personalizado/admin/${idValidado}/estado`;
  if (tipo === 'productos') path = `pedidos/admin/${idValidado}/estado`;
  if (tipo === 'paquetes') path = `citas/admin/${idValidado}/estado`;

  const response = await fetch(`${API_URL}/${path}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ estado })
  });
  return handleResponse(response);
}

export async function obtenerOpinionesAPI() {
  const response = await fetch(`${API_URL}/opiniones`);
  const data = await handleResponse(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.opiniones)) return data.opiniones;
  return [];
}

export async function crearOpinionAPI(datos) {
  const response = await fetch(`${API_URL}/opiniones`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function eliminarOpinionAPI(id) {
  const response = await fetch(`${API_URL}/opiniones/admin/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarCitaAPI(id, datos) {
  const response = await fetch(`${API_URL}/citas/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function toggleCitaAPI(id) {
  const response = await fetch(`${API_URL}/citas/${validarId(id)}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarCitaAPI(id) {
  const response = await fetch(`${API_URL}/citas/admin/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarPedidoAPI(id, datos) {
  const response = await fetch(`${API_URL}/pedidos/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function togglePedidoAPI(id) {
  const response = await fetch(`${API_URL}/pedidos/${validarId(id)}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarPedidoAPI(id) {
  const response = await fetch(`${API_URL}/pedidos/admin/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarSolicitudAPI(id, datos) {
  const response = await fetch(`${API_URL}/personalizado/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function toggleSolicitudAPI(id) {
  const response = await fetch(`${API_URL}/personalizado/${validarId(id)}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarSolicitudAdminAPI(id) {
  const response = await fetch(`${API_URL}/personalizado/admin/${validarId(id)}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarOpinionAPI(id, datos) {
  const response = await fetch(`${API_URL}/opiniones/${validarId(id)}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function toggleOpinionAPI(id) {
  const response = await fetch(`${API_URL}/opiniones/admin/${validarId(id)}/estado`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}