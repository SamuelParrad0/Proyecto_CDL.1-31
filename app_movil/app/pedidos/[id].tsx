/**
 * Este archivo muestra el detalle de un pedido del cliente
 * la ruta es dinámica porque se obtiene el pedido por su id en la url
 * Carga el pedido con servicioPedido.obtenerPedidoPorId(id)
 * Muestra la información del pedido, productos y total
 * Si el estado es pendiente permite cancelar el pedido
 */

// ── IMPORTACIONES ────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import servicioPedido from '@/src/servicios/servicioPedido';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { COLORES, ESTADOS_PEDIDO, URL_BASE_API } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

// ── TIPOS ─────────────────────────────────────────────────────────────────────
type ProductoDetalle = {
  nombre?: string;
  imagen?: string;
  Nombre_Producto?: string;
  Imagen_Producto?: string;
};

type Detalle = {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: ProductoDetalle;
  Producto?: ProductoDetalle;
};

type Pedido = {
  id: string;
  estado: string;
  createdAt: string;
  direccionEnvio?: string;
  telefono?: string;
  metodoPago?: string;
  total: number;
  detalles: Detalle[];
  DetallesPedido?: Detalle[];
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function formatCOP(value: number | undefined): string {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

function formatDate(value: string | undefined): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEstadoInfo(estado: string | undefined) {
  const key = (estado || 'pendiente').toLowerCase();
  const info = (ESTADOS_PEDIDO as Record<string, { etiqueta: string; color: string }>)[key];
  return info || { etiqueta: estado || 'Pendiente', color: COLORES.advertencia };
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function PedidoDetalleScreen() {
  const { id } = useLocalSearchParams();
  const pedidoId = Array.isArray(id) ? id[0] : id;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // ── EFECTO: Carga del pedido ──────────────────────────────────────────────
  useEffect(() => {
    if (!pedidoId) {
      setLoading(false);
      setErrorMessage('Pedido inválido');
      return;
    }

    const loadPedido = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await servicioPedido.obtenerPedidoPorId(pedidoId);
        setPedido(data);
      } catch (error) {
        const msg = (error as any)?.response?.data?.message || (error as Error).message || 'No se pudo cargar el pedido';
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    };
    loadPedido();
  }, [pedidoId]);

  // ── ESTADO UI: CARGANDO ─────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
          <Text style={styles.loadingText}>Cargando pedido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── ESTADO UI: SIN PEDIDO ─────────────────────────────────────────────────
  if (!pedido) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.centered}>
          <IconSymbol name="exclamationmark.triangle.fill" size={60} color={Tema.dark.borderRed} />
          <Text style={styles.errorTitulo}>No se encontró el pedido</Text>
          <Text style={styles.errorSubtitulo}>{errorMessage || 'Intenta de nuevo más tarde.'}</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/pedidos/mis-pedidos')}>
            <Text style={styles.primaryButtonText}>VOLVER A PEDIDOS</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Normaliza detalles para soportar dos formatos de respuesta del backend.
  const detalles: Detalle[] = pedido.detalles || pedido.DetallesPedido || [];
  const isPendiente = String(pedido.estado || '').toLowerCase() === 'pendiente';
  const estadoInfo = getEstadoInfo(pedido.estado);

  // ── FUNCIÓN: CANCELAR PEDIDO ──────────────────────────────────────────────
  const handleCancelarPedido = () => {
    if (!pedido?.id || !isPendiente || isCancelling) return;

    Alert.alert(
      'Cancelar Pedido',
      '¿Estás seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            setErrorMessage('');
            try {
              await servicioPedido.cancelarPedido(pedido.id);
              const actualizado = await servicioPedido.obtenerPedidoPorId(pedido.id);
              setPedido(actualizado);
            } catch (error) {
              setErrorMessage((error as Error)?.message || 'No fue posible cancelar el pedido.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  // ── RENDERIZADO ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con botón de regreso */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={22} color={Tema.dark.text} />
          </Pressable>
          <Text style={styles.titulo}>Detalle de Pedido</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Encabezado: número de pedido + badge de estado */}
        <View style={styles.pedidoHeader}>
          <View style={styles.rowBetween}>
            <Text style={styles.pedidoNumero}>Pedido #{pedido.id}</Text>
            <View style={[styles.badge, { borderColor: estadoInfo.color + '44', backgroundColor: estadoInfo.color + '18' }]}>
              <Text style={[styles.badgeText, { color: estadoInfo.color }]}>
                {estadoInfo.etiqueta}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <IconSymbol name="calendar" size={14} color={Tema.dark.textSecondary} />
            <Text style={styles.metaText}>{formatDate(pedido.createdAt)}</Text>
          </View>
        </View>

        {/* Bloque de datos generales del pedido */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Información del Envío</Text>
          <View style={styles.infoCard}>
            <InfoRow icono="mappin.and.ellipse" label="Dirección" value={pedido.direccionEnvio || 'No especificada'} />
            <View style={styles.separador} />
            <InfoRow icono="phone.fill" label="Teléfono" value={pedido.telefono || 'No especificado'} />
            <View style={styles.separador} />
            <InfoRow icono="creditcard.fill" label="Método de pago" value={(pedido.metodoPago || 'efectivo').charAt(0).toUpperCase() + (pedido.metodoPago || 'efectivo').slice(1)} />
          </View>
        </View>

        {/* Sección de productos del pedido */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Productos ({detalles.length})</Text>
          {detalles.map((detalle: Detalle) => {
            const producto = detalle.producto || detalle.Producto || {};
            // Nombre del producto: soporta ambos formatos del backend
            const nombreProducto = producto.Nombre_Producto || producto.nombre || 'Sin nombre';
            // Construir URL de imagen desde la API
            const baseUrl = URL_BASE_API.replace('/api', '');
            const imagenPath = producto.Imagen_Producto || producto.imagen;
            const imagen = imagenPath
              ? `${baseUrl}/uploads/${imagenPath}`
              : 'https://via.placeholder.com/90';

            return (
              <View key={detalle.id} style={styles.itemCard}>
                <Image source={{ uri: imagen }} style={styles.image} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemNombre}>{nombreProducto}</Text>
                  <Text style={styles.itemMeta}>
                    {detalle.cantidad} x {formatCOP(detalle.precioUnitario)}
                  </Text>
                  <Text style={styles.itemSubtotal}>{formatCOP(detalle.subtotal)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Total final del pedido */}
        <View style={styles.totalCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total pagado</Text>
            <Text style={styles.totalValue}>{formatCOP(pedido.total)}</Text>
          </View>
        </View>

        {/* Error operativo (ej. falla al cancelar) */}
        {errorMessage ? (
          <View style={styles.errorCard}>
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={COLORES.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Botones de acción */}
        <View style={styles.actionsRow}>
          {isPendiente ? (
            <Pressable
              style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
              onPress={handleCancelarPedido}
              disabled={isCancelling}>
              <IconSymbol name="xmark.circle.fill" size={18} color="#fff" />
              <Text style={styles.cancelButtonText}>
                {isCancelling ? 'Cancelando...' : 'CANCELAR PEDIDO'}
              </Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.secondaryButton} onPress={() => router.replace('/pedidos/mis-pedidos')}>
            <IconSymbol name="bag.fill" size={16} color={Tema.dark.tint} />
            <Text style={styles.secondaryButtonText}>Mis Pedidos</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>SEGUIR COMPRANDO</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── COMPONENTE InfoRow ─────────────────────────────────────────────────────────
function InfoRow({ icono, label, value }: { icono: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <IconSymbol name={icono} size={16} color={Tema.dark.tint} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Espaciado.md,
    padding: Espaciado.lg,
  },
  loadingText: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
  },
  // Error states
  errorTitulo: {
    color: Tema.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: Espaciado.md,
  },
  errorSubtitulo: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
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
  // Header
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
  // Pedido header
  pedidoHeader: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    padding: Espaciado.md,
    gap: Espaciado.sm,
    marginBottom: Espaciado.lg,
  },
  pedidoNumero: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Espaciado.sm,
  },
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  // Secciones
  seccion: {
    marginBottom: Espaciado.lg,
  },
  seccionTitulo: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Espaciado.md,
    letterSpacing: 1,
  },
  // Info card
  infoCard: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.md,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.surface2,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: Espaciado.md,
  },
  infoLabel: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  separador: {
    height: 1,
    backgroundColor: Tema.dark.border,
    marginLeft: 36 + Espaciado.md * 2,
  },
  // Producto cards
  itemCard: {
    borderWidth: 1,
    borderColor: Tema.dark.border,
    borderRadius: RadioBorde.lg,
    padding: Espaciado.md,
    backgroundColor: Tema.dark.surface,
    flexDirection: 'row',
    gap: Espaciado.md,
    marginBottom: Espaciado.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.surface2,
  },
  itemBody: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  itemNombre: {
    color: Tema.dark.text,
    fontSize: 15,
    fontWeight: '600',
  },
  itemMeta: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  itemSubtotal: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: '700',
  },
  // Total card
  totalCard: {
    borderWidth: 1,
    borderColor: Tema.dark.tint + '33',
    backgroundColor: Tema.dark.tint + '10',
    borderRadius: RadioBorde.lg,
    padding: Espaciado.md,
    marginBottom: Espaciado.lg,
  },
  totalLabel: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  totalValue: {
    color: Tema.dark.text,
    fontSize: 22,
    fontWeight: '700',
  },
  // Botones de acción
  actionsRow: {
    flexDirection: 'column',
    gap: Espaciado.sm,
  },
  cancelButton: {
    borderRadius: RadioBorde.md,
    paddingVertical: Espaciado.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.error,
    flexDirection: 'row',
    gap: Espaciado.sm,
  },
  cancelButtonDisabled: {
    opacity: 0.55,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Tema.dark.tint + '44',
    borderRadius: RadioBorde.md,
    paddingVertical: Espaciado.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tema.dark.surface,
    flexDirection: 'row',
    gap: Espaciado.sm,
  },
  secondaryButtonText: {
    color: Tema.dark.tint,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  primaryButton: {
    borderRadius: RadioBorde.md,
    paddingVertical: Espaciado.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tema.dark.tint,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
