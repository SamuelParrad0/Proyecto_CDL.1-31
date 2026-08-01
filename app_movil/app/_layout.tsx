// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: app/_layout.tsx
// PROPÓSITO: Layout raíz de la aplicación.
//   - Envuelve toda la app con los proveedores de contexto globales (Auth, Carrito).
//   - Configura el tema visual (claro / oscuro) con ThemeProvider.
//   - Define la navegación principal mediante un Stack Navigator de Expo Router.
//   - Cada <Stack.Screen> registra una ruta y le asigna el título de la cabecera.
// ─────────────────────────────────────────────────────────────────────────────

// ── IMPORTACIONES ────────────────────────────────────────────────────────────
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'; // Temas claro/oscuro.
import { Stack } from 'expo-router';          // Navegación por pila (Stack Navigator).
import { StatusBar } from 'expo-status-bar';  // Barra de estado del sistema operativo.
import 'react-native-reanimated';             // Requerido por Reanimated para funcionar antes de cualquier animación.

import { useColorScheme } from '../hooks/use-color-scheme'; // Hook que detecta si el dispositivo está en modo oscuro.
import { AuthProvider } from '../src/contexto/ContextoAuth';   // Proveedor de sesión de usuario (login/logout).
import { CarritoProvider } from '../src/contexto/ContextoCarrito'; // Proveedor del estado global del carrito.

// ── CONFIGURACIÓN DE EXPO ROUTER ──────────────────────────────────────────────
// unstable_settings.anchor define la pantalla inicial al abrir la app.
// '(tabs)' = la carpeta de tabs es la raíz de navegación por defecto.
export const unstable_settings = {
  anchor: '(tabs)',
};

// ── COMPONENTE RAÍZ ───────────────────────────────────────────────────────────
export default function RootLayout() {
  // Detecta si el dispositivo usa modo oscuro ('dark') o claro ('light').
  const colorScheme = useColorScheme();

  return (
    // AuthProvider: pone a disposición de toda la app el estado de sesión (usuario, token).
    <AuthProvider>
      {/* CarritoProvider: pone a disposición el carrito de compras en toda la app. */}
      <CarritoProvider>
        {/* ThemeProvider: aplica el tema visual según la preferencia del sistema. */}
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

          {/* Stack: navegador de pila. Cada pantalla se apila sobre la anterior. */}
          <Stack>
            {/* (tabs): las 3 pestañas principales (Tienda, Carrito, Cuenta). Sin cabecera propia. */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* ── Pantallas del panel de administración ── */}
            <Stack.Screen name="admin/dashboard" options={{ title: 'Dashboard Admin' }} />
            <Stack.Screen name="admin/productos" options={{ title: 'Productos' }} />
            <Stack.Screen name="admin/categorias" options={{ title: 'Categorías' }} />
            <Stack.Screen name="admin/producto-form" options={{ title: 'Crear/Editar Producto' }} />
            <Stack.Screen name="admin/usuarios" options={{ title: 'Usuarios' }} />
            <Stack.Screen name="admin/pedidos" options={{ title: 'Pedidos' }} />
            {/* Ruta dinámica: [id] se reemplaza por el ID real del pedido en tiempo de ejecución. */}
            <Stack.Screen name="admin/pedidos/[id]" options={{ title: 'Detalle Pedido' }} />
            <Stack.Screen name="admin/citas" options={{ title: 'Citas' }} />
            <Stack.Screen name="admin/paquetes" options={{ title: 'Paquetes' }} />
            <Stack.Screen name="admin/personalizado" options={{ title: 'Personalizados' }} />
            <Stack.Screen name="admin/contenidos" options={{ title: 'Contenidos' }} />
            <Stack.Screen name="admin/solicitudes" options={{ title: 'Solicitudes' }} />

            {/* ── Pantallas del flujo de compra del cliente ── */}
            <Stack.Screen name="pedidos/checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen name="pedidos/mis-pedidos" options={{ title: 'Mis pedidos' }} />
            <Stack.Screen name="pedidos/pedido-confirmado" options={{ title: 'Pedido confirmado' }} />
            <Stack.Screen name="pedidos/[id]" options={{ title: 'Detalle pedido' }} />
            <Stack.Screen name="pedidos/modal" options={{ presentation: 'modal', title: 'Modal' }} />

            {/* ── Paquetes (cliente) ── */}
            <Stack.Screen name="paquetes/index" options={{ title: 'Paquetes fotográficos', headerShown: false }} />
            <Stack.Screen name="paquetes/[id]" options={{ title: 'Detalle paquete' }} />

            {/* ── Citas / Reservas de paquetes (cliente) ── */}
            <Stack.Screen name="citas/index" options={{ title: 'Mis citas', headerShown: false }} />
            <Stack.Screen name="citas/nueva" options={{ title: 'Reservar paquete' }} />
            <Stack.Screen name="citas/mis-solicitudes" options={{ title: 'Mis Solicitudes', headerShown: true }} />

            {/* ── Personalizado (cliente) ── */}
            <Stack.Screen name="personalizado/index" options={{ title: 'Mis solicitudes personalizadas', headerShown: false }} />
            <Stack.Screen name="personalizado/nueva" options={{ title: 'Nueva solicitud personalizada' }} />

            {/* ── Otras pantallas de cliente ── */}
            <Stack.Screen name="galeria/index" options={{ title: 'Galería', headerShown: false }} />
            <Stack.Screen name="faq/index" options={{ title: 'Preguntas frecuentes', headerShown: false }} />
            <Stack.Screen name="direcciones/index" options={{ title: 'Mis direcciones', headerShown: false }} />
          </Stack>

          {/* StatusBar: ajusta automáticamente el color de los íconos (claro/oscuro) según el tema. */}
          <StatusBar style="auto" />
        </ThemeProvider>
      </CarritoProvider>
    </AuthProvider>
  );
}
