# Communicating Design Lion — Frontend React

Migración completa del proyecto HTML/CSS/JS a React con React Router v6.

## Estructura del proyecto

```
src/
├── App.js                        ← Router principal (todas las rutas)
├── index.js                      ← Punto de entrada
├── componentes/
│   ├── Inicio/
│   │   └── PaginaInicio.js       ← Página principal (Hero, Servicios, Paquetes, Galería, Productos, FAQ, Reseñas, Footer)
│   ├── Carrito/
│   │   ├── PaginaCarrito.js      ← Carrito de compras
│   │   ├── PaginaEntrega.js      ← Selección de dirección de entrega
│   │   ├── PaginaPago.js         ← Métodos de pago
│   │   └── PaginaFactura.js      ← Factura / confirmación de pedido
│   ├── Citas/
│   │   └── PaginaCitas.js        ← Formulario de citas / solicitud de servicios
│   ├── Pedidos/
│   │   └── PaginaPedidos.js      ← Formulario de pedidos de productos
│   ├── Autenticacion/
│   │   ├── PaginaLogin.js        ← Inicio de sesión
│   │   └── PaginaRegistro.js     ← Registro de usuario
│   ├── Perfil/
│   │   └── PaginaPerfil.js       ← Perfil de usuario (datos, direcciones, compras, solicitudes)
│   ├── Personalizado/
│   │   └── PaginaPersonalizado.js← Formulario de servicio personalizado
│   └── compartidos/
│       ├── NavegacionPrincipal.js← Navbar con menú móvil
│       ├── BarraEntrega.js       ← Barra de dirección de entrega + modal
│       ├── RedesSocialesFlotantes.js ← Botón flotante de redes
│       ├── useScrollReveal.js    ← Hook para animaciones de entrada
│       └── useToast.js           ← Hook para notificaciones emergentes
├── contexto/
│   └── CarritoContexto.js        ← Estado global del carrito (Context API)
├── datos/
│   └── datos.js                  ← Todos los datos: galería, productos, paquetes, FAQ, reseñas
└── estilos/
    ├── global.css                ← Importa todos los CSS
    ├── inicio.css
    ├── carrito.css
    ├── entrega.css
    ├── factura.css
    ├── pago.css
    ├── citas.css
    ├── autenticacion.css
    ├── pedidos.css
    ├── perfil.css
    └── personalizado.css
```

## Rutas disponibles

| Ruta                  | Componente          |
|-----------------------|---------------------|
| `/`                   | PaginaInicio        |
| `/carrito`            | PaginaCarrito       |
| `/carrito/entrega`    | PaginaEntrega       |
| `/carrito/pago`       | PaginaPago          |
| `/carrito/factura`    | PaginaFactura       |
| `/citas`              | PaginaCitas         |
| `/pedidos`            | PaginaPedidos       |
| `/login`              | PaginaLogin         |
| `/registro`           | PaginaRegistro      |
| `/perfil`             | PaginaPerfil        |
| `/personalizado`      | PaginaPersonalizado |

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm start

# 3. Construir para producción
npm run build
```

## Notas sobre assets

Los videos en `public/Imagenes_Videos/Videos_CDL/` NO están incluidos en este ZIP
por su tamaño (>200MB). Para usarlos:

1. Copia manualmente los archivos `.mp4` del proyecto original a esa carpeta:
   - `Cartagena_horizontal.mp4`
   - `Dron_Video_horizontal.mp4`
   - `Monserrate_horizontal.mp4`
   - `Paisaje_Video_horizontal.mp4`
   - `Viaje.mp4`

Las imágenes de productos y la imagen especial `Madrecita.png` **sí están incluidas**.

## localStorage — claves usadas

| Clave                  | Descripción                                      |
|------------------------|--------------------------------------------------|
| `productoCarrito`      | Array de ítems del carrito                       |
| `cdl_sesion_activa`    | `'true'` si hay sesión activa                    |
| `cdl_usuario`          | Datos del usuario registrado                     |
| `cdl_direccion`        | Dirección principal de entrega (desde el Index)  |
| `cdl_dirs_entrega`     | Direcciones adicionales (desde Entrega)          |
| `cdl_direcciones`      | Direcciones del perfil de usuario                |
| `cdl_cita_previa`      | Paquete preseleccionado al ir a Citas            |
| `cdl_pedido_previo`    | Producto/paquete preseleccionado al ir a Pedidos |
| `datosPago`            | Datos del pago procesado                         |
| `cdl_solicitudes`      | Historial de solicitudes del usuario             |
| `cdl_compras`          | Historial de compras del usuario                 |

## Integración con backend

El proyecto está preparado para conectarse a un backend. Los puntos de integración son:

- `CarritoContexto.js` → reemplazar localStorage por llamadas a API
- `PaginaLogin.js` / `PaginaRegistro.js` → conectar con endpoint de autenticación
- `PaginaCitas.js` → enviar formulario al backend en lugar de simular
- `PaginaPedidos.js` → agregar ítem al carrito vía API
- `PaginaPersonalizado.js` → enviar formulario al backend
