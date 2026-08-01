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
    // Limpiar dirección del usuario anterior
    localStorage.removeItem('cdl_direccion');
    localStorage.removeItem('cdl_dirs_entrega');
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    // Cargar dirección guardada del nuevo usuario desde la BD
    try {
      const resDirs = await fetch(`${API_URL}/direcciones`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` }
      });
      const dataDirs = await resDirs.json();
      const dirs = Array.isArray(dataDirs) ? dataDirs
        : Array.isArray(dataDirs.direcciones) ? dataDirs.direcciones : [];
      if (dirs.length > 0) {
        const primera = dirs[0];
        localStorage.setItem('cdl_direccion', JSON.stringify({
          nombre:      primera.Nombre_Completo || '',
          direccion:   primera.Direccion || '',
          departamento: primera.Departamento || '',
          municipio:   primera.Municipio_Localidad || '',
          barrio:      primera.Barrio || '',
          apto:        primera.Apart_Casa || '',
          telefono:    primera.Telefono || '',
          indicaciones: primera.Indicaciones || '',
          tipo:        primera.Residencia_Laboral || 'residencial'
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
    ? `${API_URL}/productos/categoria/${categoriaId}`
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
  const response = await fetch(`${API_URL}/productos/${id}`);
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
  const response = await fetch(`${API_URL}/citas/${id}/cancelar`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function cancelarPedidoAPI(id) {
  const response = await fetch(`${API_URL}/pedidos/${id}/cancelar`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function cancelarPersonalizadoAPI(id) {
  const response = await fetch(`${API_URL}/personalizado/${id}/cancelar`, {
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
  const response = await fetch(`${API_URL}/carrito/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function actualizarCantidadCarritoAPI(id, cantidad) {
  const response = await fetch(`${API_URL}/carrito/${id}`, {
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
  const response = await fetch(`${API_URL}/direcciones/${id}`, {
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
  const response = await fetch(`${API_URL}/direcciones/${id}`, {
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
  const response = await fetch(`${API_URL}/auth/usuarios/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function actualizarRolAPI(id, nuevoRol) {
  const response = await fetch(`${API_URL}/auth/admin/${id}/rol`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ nuevoRol })
  });
  return handleResponse(response);
}

export async function toggleUsuarioAPI(id) {
  const response = await fetch(`${API_URL}/auth/usuarios/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarUsuarioAPI(id, datos) {
  const response = await fetch(`${API_URL}/auth/usuarios/${id}`, {
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
  const response = await fetch(`${API_URL}/productos/admin/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function toggleProductoAPI(id) {
  const response = await fetch(`${API_URL}/productos/admin/${id}/activar`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarProductoAPI(id) {
  const response = await fetch(`${API_URL}/productos/admin/${id}`, {
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
  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function eliminarCategoriaAPI(id) {
  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function toggleCategoriaAPI(id) {
  const response = await fetch(`${API_URL}/categorias/${id}/activar`, {
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
  const response = await fetch(`${API_URL}/paquetes/admin/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function eliminarPaqueteAPI(id) {
  const response = await fetch(`${API_URL}/paquetes/admin/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function togglePaqueteAPI(id) {
  const response = await fetch(`${API_URL}/paquetes/admin/${id}/toggle`, {
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

  // Extraer el array según qué devuelva cada endpoint
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.solicitudes)) return data.solicitudes;
  if (Array.isArray(data.citas)) return data.citas;
  if (Array.isArray(data.pedidos)) return data.pedidos;
  if (Array.isArray(data.reservas)) return data.reservas;
  return [];
}

export async function actualizarEstadoSolicitudAPI(tipo, id, estado) {
  let path = `personalizado/admin/${id}/estado`;
  if (tipo === 'productos') path = `pedidos/admin/${id}/estado`;
  if (tipo === 'paquetes') path = `citas/admin/${id}/estado`;

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
  const response = await fetch(`${API_URL}/opiniones/admin/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

// --- Nuevas funciones de edición y toggle ---
export async function editarCitaAPI(id, datos) {
  const response = await fetch(`${API_URL}/citas/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function toggleCitaAPI(id) {
  const response = await fetch(`${API_URL}/citas/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarCitaAPI(id) {
  const response = await fetch(`${API_URL}/citas/admin/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarPedidoAPI(id, datos) {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function togglePedidoAPI(id) {
  const response = await fetch(`${API_URL}/pedidos/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarPedidoAPI(id) {
  const response = await fetch(`${API_URL}/pedidos/admin/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarSolicitudAPI(id, datos) {
  const response = await fetch(`${API_URL}/personalizado/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function toggleSolicitudAPI(id) {
  const response = await fetch(`${API_URL}/personalizado/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function eliminarSolicitudAdminAPI(id) {
  const response = await fetch(`${API_URL}/personalizado/admin/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}

export async function editarOpinionAPI(id, datos) {
  const response = await fetch(`${API_URL}/opiniones/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  });
  return handleResponse(response);
}

export async function toggleOpinionAPI(id) {
  const response = await fetch(`${API_URL}/opiniones/admin/${id}/estado`, {
    method: 'PATCH',
    headers: getHeaders(true)
  });
  return handleResponse(response);
}