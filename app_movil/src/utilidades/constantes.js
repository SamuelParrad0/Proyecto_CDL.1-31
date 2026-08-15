/**
 * CONSTANTES GLOBALES DE LA APLICACIÓN CDL MÓVIL
 * Centraliza URLs, claves de almacenamiento, colores, datos estáticos y configuraciones.
 */

// ─── CONEXIÓN AL BACKEND ──────────────────────────────────────────────────────
// Emulador Android: usa 10.0.2.2 para acceder al localhost del PC
// Dispositivo físico: cambia por la IP LAN del PC (ej. http://192.168.1.X:5000/api)
// Por defecto para emulador Android use localhost del PC (10.0.2.2).
// Si usas un dispositivo físico cambia esta URL por la IP LAN de tu PC
// (ej. http://192.168.1.5:5000/api).
export const URL_BASE_API = 'http://192.168.1.12:5000/api';
export const TIEMPO_ESPERA_MS = 15000; // 15 segundos

// ─── CLAVES DE ALMACENAMIENTO LOCAL ──────────────────────────────────────────
export const CLAVES_STORAGE = {
  token: 'cdl_token',
  usuario: 'cdl_usuario',
  carritoLocal: 'cdl_carrito_local',
  clientesCarrito: 'cdl_clientes_carrito',
};

// ─── COLORES DEL TEMA (Paleta del frontend) ───────────────────────────────────
export const COLORES = {
  // Primario
  rojo: '#ff0844',
  rojoHover: '#ff3366',
  rojoDark: '#cc0033',
  rojoGlow: 'rgba(255, 8, 68, 0.50)',
  rojoSuave: 'rgba(255, 8, 68, 0.10)',
  rojoMid: 'rgba(255, 8, 68, 0.22)',

  // Acento
  cyan: '#00d9ff',
  cyanGlow: 'rgba(0, 217, 255, 0.35)',
  dorado: '#c9a060',

  // Fondos oscuros
  fondo0: '#030308',
  fondo1: '#07070f',
  fondo2: '#0c0c18',
  fondo3: '#111120',

  // Superficies
  superficie: '#161625',
  superficie2: '#1c1c2e',

  // Bordes
  borde: 'rgba(255, 255, 255, 0.055)',
  bordeRojo: 'rgba(255, 8, 68, 0.18)',

  // Texto
  textoPrimario: '#eae8f2',
  textoSecundario: '#8484a8',
  textoMuted: '#3c3c58',

  // Estados
  exito: '#22c55e',
  advertencia: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Utilidades
  blanco: '#ffffff',
  negro: '#000000',
  transparente: 'transparent',
};

// ─── DEPARTAMENTOS DE COLOMBIA ────────────────────────────────────────────────
export const DEPARTAMENTOS_COLOMBIA = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá', 'Bolívar',
  'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
  'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
  'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada',
];

// ─── DATOS FAQ ────────────────────────────────────────────────────────────────
export const DATOS_FAQ = [
  {
    pregunta: '¿Ofrecen diseños personalizados para invitaciones?',
    respuesta: 'Sí, ofrecemos invitaciones personalizadas tanto físicas como digitales, adaptadas al estilo y necesidades de cada evento.',
  },
  {
    pregunta: '¿Puedo agendar una reunión virtual con ustedes?',
    respuesta: 'Sí, puedes agendar una reunión virtual con nosotros. Solo tienes que contactarnos y coordinar el horario que más te convenga para presentarte nuestras propuestas.',
  },
  {
    pregunta: '¿Trabajan en todo Bogotá?',
    respuesta: 'Sí, trabajamos en toda Bogotá, ofreciendo nuestros servicios a clientes en toda la ciudad. Para envíos de productos físicos también tenemos cobertura nacional a todo el territorio colombiano.',
  },
  {
    pregunta: '¿Digitalizan cintas antiguas como VHS o Hi8?',
    respuesta: 'Sí, ofrecemos el servicio de digitalización de medios antiguos, incluyendo cintas VHS, Hi8 y otros formatos, para que puedas preservarlos en formatos digitales modernos con la mejor calidad posible.',
  },
  {
    pregunta: '¿Puedo traer mi propia idea o boceto?',
    respuesta: '¡Claro! Si tienes una idea o boceto, podemos trabajar juntos para hacerla realidad. Nos encanta recibir propuestas creativas y personalizadas de nuestros clientes.',
  },
  {
    pregunta: '¿Qué tipo de archivo entregan para los videos?',
    respuesta: 'Te entregamos los videos editados en una USB especial personalizada para ti, además de un enlace de descarga en la nube con la mejor calidad disponible, para que tengas acceso fácil desde cualquier dispositivo.',
  },
  {
    pregunta: '¿Trabajan con contratos o acuerdos escritos?',
    respuesta: 'Sí, trabajamos con contratos o acuerdos escritos para asegurar que todas las condiciones estén claras y ambas partes estemos de acuerdo con los términos del servicio.',
  },
];

// ─── DATOS DE GALERÍA ─────────────────────────────────────────────────────────
export const DATOS_GALERIA = [
  { src: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=85', categoria: 'bodas', titulo: 'Ceremonia al Atardecer' },
  { src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=85', categoria: 'graduaciones', titulo: 'Graduación 2024' },
  { src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=85', categoria: 'bodas', titulo: 'Amor Eterno' },
  { src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&q=85', categoria: 'eventos', titulo: 'Evento Corporativo' },
  { src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=85', categoria: 'fotografía', titulo: 'Fotografía de Producto' },
  { src: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=900&q=85', categoria: 'productos', titulo: 'Bolsa Sorpresa CDL' },
  { src: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=900&q=85', categoria: 'eventos', titulo: 'Naturaleza y Vida' },
  { src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=900&q=85', categoria: 'productos', titulo: 'Caja de Recuerdos' },
  { src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=85', categoria: 'graduaciones', titulo: 'Libro de Memorias' },
  { src: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=900&q=85', categoria: 'fotografía', titulo: 'Detalle Artístico' },
  { src: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=85', categoria: 'bodas', titulo: 'Ramo de Novia' },
  { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=85', categoria: 'eventos', titulo: 'Paisaje Natural' },
];

// ─── CATEGORÍAS DE GALERÍA ────────────────────────────────────────────────────
export const CATEGORIAS_GALERIA = ['todas', 'bodas', 'graduaciones', 'eventos', 'fotografía', 'productos'];

// ─── ESTADOS DE PEDIDOS ───────────────────────────────────────────────────────
export const ESTADOS_PEDIDO = {
  pendiente: { etiqueta: 'Pendiente', color: COLORES.advertencia, icono: 'clock.fill' },
  pagado: { etiqueta: '¡Manos a la obra!', color: COLORES.info, icono: 'hammer.fill' },
  enviado: { etiqueta: 'Viajando hacia ti', color: COLORES.cyan, icono: 'box.truck.fill' },
  entregado: { etiqueta: '¡Ya contigo!', color: COLORES.exito, icono: 'checkmark.seal.fill' },
  cancelado: { etiqueta: 'Cancelado', color: COLORES.error, icono: 'xmark.circle.fill' },
};

// ─── ESTADOS DE CITAS ─────────────────────────────────────────────────────────
export const ESTADOS_CITA = {
  pendiente:       { etiqueta: 'Pendiente',           color: COLORES.advertencia, icono: 'clock.fill' },
  en_contacto:     { etiqueta: 'En contacto contigo', color: COLORES.info,        icono: 'bubble.left.and.bubble.right.fill' },
  agendada:        { etiqueta: 'Agendada',             color: '#a855f7',           icono: 'calendar.badge.clock' },
  mision_cumplida: { etiqueta: '¡Misión cumplida!',   color: COLORES.exito,       icono: 'checkmark.seal.fill' },
  cancelada:       { etiqueta: 'Cancelado',            color: COLORES.error,       icono: 'xmark.circle.fill' },
};

// ─── ESTADOS DE PERSONALIZADO ─────────────────────────────────────────────────
export const ESTADOS_PERSONALIZADO = {
  pendiente: { etiqueta: 'Pendiente', color: COLORES.advertencia },
  en_proceso: { etiqueta: 'En proceso', color: COLORES.info },
  completado: { etiqueta: 'Completado', color: COLORES.exito },
  cancelado: { etiqueta: 'Cancelado', color: COLORES.error },
  cancelada: { etiqueta: 'Cancelada', color: COLORES.error },
};

// ─── TIPOS DE EVENTOS (para citas) ───────────────────────────────────────────
export const TIPOS_EVENTO = [
  'Boda', 'Graduación', 'Quinceañera', 'Baby Shower', 'Cumpleaños',
  'Corporativo', 'Bautizo', 'Primera Comunión', 'Otro',
];

// ─── PRIORIDADES PERSONALIZADO ────────────────────────────────────────────────
export const PRIORIDADES_PERSONALIZADO = [
  'Calidad premium', 'Entrega rápida', 'Precio accesible', 'Diseño único',
];
