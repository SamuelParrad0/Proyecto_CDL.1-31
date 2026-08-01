// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: app/pedidos/mis-pedidos.tsx
// PROPÓSITO: Lista todos los pedidos del cliente autenticado.
//   - Se recarga automáticamente cada vez que el usuario vuelve a esta pantalla
//     gracias a useFocusEffect (útil después de cancelar un pedido).
//   - Muestra un estado vacío si el cliente aún no tiene pedidos.
//   - Cada tarjeta de pedido navega al detalle en /pedidos/[id].
// ─────────────────────────────────────────────────────────────────────────────

// ── IMPORTACIONES ────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // Hook que dispara un callback al enfocar la pantalla.
import { useCallback, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthContext } from '@/src/contexto/ContextoAuth';
import servicioPedido from '@/src/servicios/servicioPedido';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { COLORES, ESTADOS_PEDIDO } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

// ── TIPO: Pedido ──────────────────────────────────────────────────────────────
// Solo los campos que se muestran en la lista (no incluye detalles completos).
type Pedido = {
  id?: string;
  _id?: string;        // MongoDB puede devolver _id en vez de id.
  estado?: string;
  total?: number;
  createdAt?: string;
  detalles?: unknown[]; // Arreglo de productos (solo se usa .length aquí).
};

// ── HELPERS DE NAVEGACIÓN ─────────────────────────────────────────────────────
// Cast necesario porque Expo Router tiifica estrictamente los paths.
const routerReplace = (path: string) => (router as unknown as { replace: (p: string) => void }).replace(path);
const routerPush    = (path: string) => (router as unknown as { push:    (p: string) => void }).push(path);

// ── HELPERS DE FORMATO ─────────────────────────────────────────────────────────
// Formatea un valor numérico a pesos colombianos.
function formatCOP(value: unknown) {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

// Formatea una fecha ISO a formato legible en español colombiano.
function formatDate(value: unknown) {
  if (!value) {
    return '-';
  }
  return new Date(value as string).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Obtiene el color y etiqueta del estado del pedido.
function getEstadoInfo(estado: string | undefined) {
  const key = (estado || 'pendiente').toLowerCase();
  const info = (ESTADOS_PEDIDO as Record<string, { etiqueta: string; color: string }>)[key];
  return info || { etiqueta: estado || 'Pendiente', color: COLORES.advertencia };
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function MisPedidosScreen() {

  // ── CONTEXTO Y ESTADO ─────────────────────────────────────────────────────
  const { estaAutenticado: isAuthenticated } = useContext(AuthContext) as any;
  const [pedidos, setPedidos]           = useState<Pedido[]>([]);
  const [loading, setLoading]           = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // ── FUNCIÓN: loadPedidos ───────────────────────────────────────────────────
  // Consulta GET /pedidos/mis-pedidos y almacena los resultados en el estado.
  // Está envuelta en useCallback para poder pasarla a useFocusEffect y useEffect
  // sin crear una referencia nueva en cada render (evita bucles infinitos).
  const loadPedidos = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return; // No carga si no hay sesión (la guardia lo mostrará primero).
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const data = await servicioPedido.obtenerMisPedidos();
      // Garantiza que el estado siempre sea un arreglo, aunque la API devuelva null.
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      setErrorMessage((error as { message?: string })?.message || 'No fue posible cargar tus pedidos.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ── EFECTOS ───────────────────────────────────────────────────────────────
  // Carga inicial al montar el componente.
  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  // Recarga cada vez que el usuario navega de regreso a esta pantalla.
  // Útil por ejemplo después de cancelar un pedido desde /pedidos/[id].
  useFocusEffect(
    useCallback(() => {
      loadPedidos();
    }, [loadPedidos])
  );

  // ── GUARDIA: usuario no autenticado ───────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.centered}>
          <IconSymbol name="person.crop.circle.badge.exclamationmark" size={70} color={Tema.dark.borderRed} />
          <Text style={styles.noAuthTitulo}>Debes iniciar sesión</Text>
          <Text style={styles.noAuthSubtitulo}>Inicia sesión para ver tu historial de pedidos.</Text>
          <Pressable style={styles.primaryButton} onPress={() => routerReplace('/(tabs)/explore')}>
            <Text style={styles.primaryButtonText}>IR A CUENTA</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── ESTADO DE CARGA ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── RENDERIZADO PRINCIPAL ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={22} color={Tema.dark.text} />
          </Pressable>
          <Text style={styles.titulo}>Mis Pedidos</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Mensaje de error si la petición falló */}
        {errorMessage ? (
          <View style={styles.errorCard}>
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={COLORES.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {pedidos.length === 0 ? (
          // ── Estado vacío ────────────────────────────────────────────────────
          <View style={styles.emptyState}>
            <IconSymbol name="bag" size={60} color={Tema.dark.textSecondary} />
            <Text style={styles.emptyTitulo}>Aún no tienes pedidos</Text>
            <Text style={styles.emptySubtitulo}>Cuando compres, aparecerán aquí.</Text>
            <Pressable style={styles.primaryButton} onPress={() => routerReplace('/(tabs)/')}>
              <Text style={styles.primaryButtonText}>IR A TIENDA</Text>
            </Pressable>
          </View>
        ) : (
          // ── Lista de tarjetas de pedido ──────────────────────────────────
          pedidos.map((pedido) => {
            const estadoInfo = getEstadoInfo(pedido.estado);
            return (
              <Pressable
                key={pedido.id || pedido._id}
                style={styles.card}
                // Navega al detalle del pedido pasando el ID en la URL dinámica.
                onPress={() => routerPush(`/pedidos/${pedido.id || pedido._id}`)}>
                
                {/* Fila superior: número de pedido + badge */}
                <View style={styles.rowBetween}>
                  <Text style={styles.pedidoNumero}>Pedido #{pedido.id || pedido._id}</Text>
                  <View style={[styles.badge, { borderColor: estadoInfo.color + '44', backgroundColor: estadoInfo.color + '18' }]}>
                    <Text style={[styles.badgeText, { color: estadoInfo.color }]}>
                      {estadoInfo.etiqueta}
                    </Text>
                  </View>
                </View>

                {/* Fecha de creación */}
                <View style={styles.metaRow}>
                  <IconSymbol name="calendar" size={14} color={Tema.dark.textSecondary} />
                  <Text style={styles.metaText}>{formatDate(pedido.createdAt)}</Text>
                </View>

                {/* Fila inferior: cantidad de productos + total */}
                <View style={styles.rowBetween}>
                  <View style={styles.metaRow}>
                    <IconSymbol name="bag.fill" size={14} color={Tema.dark.textSecondary} />
                    <Text style={styles.metaText}>{(pedido.detalles as unknown[])?.length || 0} producto(s)</Text>
                  </View>
                  <Text style={styles.totalText}>{formatCOP(pedido.total)}</Text>
                </View>

                {/* Indicador de navegación */}
                <View style={styles.verDetalleRow}>
                  <Text style={styles.verDetalleText}>Ver detalle</Text>
                  <IconSymbol name="chevron.right" size={14} color={Tema.dark.tint} />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  scrollContent: {
    padding: Espaciado.lg,
    paddingBottom: Espaciado.xxl,
  },
  // Centra el contenido de las pantallas de guardia y carga.
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciado.md,
    padding: Espaciado.lg,
  },
  // Header con botón de regreso
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Espaciado.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.surface,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    color: Tema.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // Textos no autenticado
  noAuthTitulo: {
    color: Tema.dark.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  noAuthSubtitulo: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
  },
  // Error card
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.sm,
    backgroundColor: COLORES.error + '15',
    borderWidth: 1,
    borderColor: COLORES.error + '33',
    borderRadius: RadioBorde.lg,
    padding: Espaciado.md,
    marginBottom: Espaciado.md,
  },
  errorText: {
    color: COLORES.error,
    fontSize: 13,
    flex: 1,
  },
  // Estado vacío
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Espaciado.xxl,
    gap: Espaciado.md,
  },
  emptyTitulo: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtitulo: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  // Tarjeta individual de pedido
  card: {
    borderWidth: 1,
    borderColor: Tema.dark.border,
    borderRadius: RadioBorde.lg,
    padding: Espaciado.md,
    backgroundColor: Tema.dark.surface,
    gap: Espaciado.sm,
    marginBottom: Espaciado.md,
  },
  // Fila con dos elementos a los extremos
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Espaciado.sm,
  },
  pedidoNumero: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  // Badge del estado
  badge: {
    borderWidth: 1,
    borderRadius: RadioBorde.redondo,
    paddingHorizontal: Espaciado.sm + 2,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Fila de metadatos
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  totalText: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  // "Ver detalle" indicador
  verDetalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
    paddingTop: Espaciado.sm,
  },
  verDetalleText: {
    color: Tema.dark.tint,
    fontSize: 13,
    fontWeight: '600',
  },
  // Botón primario
  primaryButton: {
    borderRadius: RadioBorde.md,
    paddingVertical: Espaciado.md,
    paddingHorizontal: Espaciado.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tema.dark.tint,
    marginTop: Espaciado.sm,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
