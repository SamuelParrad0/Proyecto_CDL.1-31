import { useMemo, useState, useContext } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { CarritoContext } from '@/src/contexto/ContextoCarrito';
import servicioPedido from '@/src/servicios/servicioPedido';

const routerReplace = (path: string) => (router as unknown as { replace: (p: string) => void }).replace(path);

const PAYMENT_METHODS = [
  { key: 'efectivo',       label: 'Efectivo' },
  { key: 'tarjeta',        label: 'Tarjeta' },
  { key: 'transferencia',  label: 'Transferencia' },
];

export default function CheckoutScreen() {
  const { estaAutenticado: isAuthenticated } = useContext(AuthContext) as any;
  const { totalPrecio: total, items, cargando: loading, recargarCarrito: refreshCarrito } = useContext(CarritoContext) as any;

  const [direccionEnvio, setDireccionEnvio]     = useState('');
  const [telefono, setTelefono]                 = useState('');
  const [metodoPago, setMetodoPago]             = useState('efectivo');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [submitting, setSubmitting]             = useState(false);
  const [errorMessage, setErrorMessage]         = useState('');

  const canSubmit = useMemo(() => {
    return Boolean(direccionEnvio.trim()) && Boolean(telefono.trim()) && items.length > 0 && !submitting;
  }, [direccionEnvio, telefono, items.length, submitting]);

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <ThemedText type="title">Debes iniciar sesion</ThemedText>
        <ThemedText style={styles.subtitle}>Para finalizar la compra entra en tu cuenta.</ThemedText>
        <Pressable style={styles.primaryButton} onPress={() => routerReplace('/(tabs)/explore')}>
          <ThemedText style={styles.primaryButtonText}>Ir a Cuenta</ThemedText>
        </Pressable>
      </View>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ThemedText type="title">Carrito vacio</ThemedText>
        <ThemedText style={styles.subtitle}>Agrega productos antes de continuar.</ThemedText>
        <Pressable style={styles.primaryButton} onPress={() => routerReplace('/(tabs)/')}>
          <ThemedText style={styles.primaryButtonText}>Volver a Tienda</ThemedText>
        </Pressable>
      </View>
    );
  }

  const handleConfirm = async () => {
    setErrorMessage('');

    if (!direccionEnvio.trim()) {
      setErrorMessage('Ingresa la direccion de envio.');
      return;
    }
    if (!telefono.trim()) {
      setErrorMessage('Ingresa un telefono de contacto.');
      return;
    }

    setSubmitting(true);
    try {
      const pedido = await servicioPedido.crearPedido({
        direccionEnvio:     direccionEnvio.trim(),
        telefono:           telefono.trim(),
        metodoPago,
        notas:              notasAdicionales.trim(),
      });

      await refreshCarrito();

      const pedidoId = pedido?.id;
      if (pedidoId) {
        routerReplace(`/pedidos/pedido-confirmado?pedidoId=${pedidoId}`);
      } else {
        routerReplace('/pedidos/pedido-confirmado');
      }
    } catch (error: unknown) {
      setErrorMessage((error as { message?: string })?.message || 'No fue posible confirmar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Checkout</ThemedText>
        <ThemedText style={styles.subtitle}>Completa los datos para confirmar tu pedido.</ThemedText>

        {Boolean(errorMessage) && <ThemedText style={styles.error}>{errorMessage}</ThemedText>}

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold">Direccion de envio</ThemedText>
          <TextInput
            value={direccionEnvio}
            onChangeText={setDireccionEnvio}
            placeholder="Ej: Calle 10 # 20-30, Bucaramanga"
            style={[styles.input, styles.multiline]}
            multiline
          />

          <ThemedText type="defaultSemiBold">Telefono</ThemedText>
          <TextInput
            value={telefono}
            onChangeText={setTelefono}
            placeholder="3001234567"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <ThemedText type="defaultSemiBold">Metodo de pago</ThemedText>
          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((method) => {
              const selected = method.key === metodoPago;
              return (
                <Pressable
                  key={method.key}
                  onPress={() => setMetodoPago(method.key)}
                  style={[
                    styles.paymentChip,
                    selected && styles.paymentChipSelected,
                  ]}>
                  <ThemedText style={selected ? styles.paymentChipTextSelected : undefined}>
                    {method.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="defaultSemiBold">Notas (opcional)</ThemedText>
          <TextInput
            value={notasAdicionales}
            onChangeText={setNotasAdicionales}
            placeholder="Indicaciones de entrega"
            style={[styles.input, styles.multiline]}
            multiline
          />
        </ThemedView>

        <ThemedView style={styles.summary}>
          <ThemedText type="defaultSemiBold">Resumen</ThemedText>
          <ThemedText>{items.length} producto(s)</ThemedText>
          <ThemedText style={styles.total}>Total: ${Number(total || 0).toLocaleString('es-CO')}</ThemedText>
        </ThemedView>

        <Pressable
          style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
          onPress={handleConfirm}
          disabled={!canSubmit}>
          <ThemedText style={styles.primaryButtonText}>
            {submitting ? 'Procesando...' : 'Confirmar pedido'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 },
  subtitle: { color: '#666' },
  section: { borderRadius: 12, padding: 12, gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentChip: {
    borderWidth: 1,
    borderColor: '#d2d2d2',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  paymentChipSelected: { borderColor: '#0a7ea4', backgroundColor: '#dff3fb' },
  paymentChipTextSelected: { color: '#04566f', fontWeight: '700' },
  summary: {
    borderWidth: 1,
    borderColor: '#dceeff',
    backgroundColor: '#f6fbff',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  total: { fontSize: 18, fontWeight: '700' },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
  },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#b93a32' },
});