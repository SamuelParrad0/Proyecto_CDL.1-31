import { useState, useEffect, useContext } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { ThemedText } from '../../../components/themed-text';
import clienteApi from '@/src/api/clienteApi';

type Detalle = {
  producto?: { nombre?: string };
  cantidad?: number;
  precio?: number;
};

type Pedido = {
  id: number;
  estado?: string;
  total?: number;
  createdAt?: string;
  usuario?: {
    nombre?: string;
    apellido?: string;
    email?: string;
  };
  detalles?: Detalle[];
};

export default function AdminPedidoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { esAdmin, esAuxiliar, estaAutenticado } = useContext(AuthContext) as any;

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cambiando, setCambiando] = useState(false);

  const fetchPedido = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await clienteApi.get(`/admin/pedidos/${id}`);
      setPedido(res.data?.data?.pedido || null);
    } catch (error: unknown) {
      setErrorMessage((error as { message?: string })?.message || 'No fue posible cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!estaAutenticado || (!esAdmin && !esAuxiliar)) {
      router.replace('/(tabs)');
      return;
    }
    fetchPedido();
  }, [id, estaAutenticado, esAdmin, esAuxiliar]);

  const cambiarEstado = async (nuevoEstado: string) => {
    setCambiando(true);
    try {
      await clienteApi.put(`/admin/pedidos/${id}/estado`, { estado: nuevoEstado });
      await fetchPedido();
      Alert.alert('Éxito', 'Estado del pedido actualizado');
    } catch (error: unknown) {
      const msg = (error as any)?.message || 'No se pudo cambiar el estado del pedido';
      Alert.alert('Error', msg);
    } finally {
      setCambiando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>Cargando pedido...</ThemedText>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.error}>{errorMessage}</ThemedText>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.centered}>
        <ThemedText>No se encontró el pedido.</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Pedido #{pedido.id}</ThemedText>

      <ThemedText>Cliente: {pedido.usuario?.nombre} {pedido.usuario?.apellido}</ThemedText>
      <ThemedText>Email: {pedido.usuario?.email}</ThemedText>
      <ThemedText>Estado: {pedido.estado}</ThemedText>
      <ThemedText>Total: ${Number(pedido.total || 0).toLocaleString('es-CO')}</ThemedText>
      <ThemedText>Fecha: {pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('es-CO') : '-'}</ThemedText>

      <ThemedText style={styles.sectionTitle}>Productos:</ThemedText>

      {pedido.detalles?.map((det: Detalle) => {
        const itemKey = `${det.producto?.nombre || 'prod'}-${det.cantidad}-${det.precio}`;
        return (
          <View key={itemKey} style={styles.detalleRow}>
            <ThemedText>{det.producto?.nombre} x{det.cantidad}</ThemedText>
            <ThemedText>${Number(det.precio || 0).toLocaleString('es-CO')}</ThemedText>
          </View>
        );
      })}

      <View style={styles.actionsRow}>
        {pedido.estado === 'pendiente' && (
          <Pressable
            style={styles.actionBtn}
            onPress={() => cambiarEstado('enviado')}
            disabled={cambiando}
          >
            <ThemedText style={styles.actionBtnText}>Marcar como Enviado</ThemedText>
          </Pressable>
        )}

        {pedido.estado === 'enviado' && (
          <Pressable
            style={styles.actionBtn}
            onPress={() => cambiarEstado('entregado')}
            disabled={cambiando}
          >
            <ThemedText style={styles.actionBtnText}>Marcar como Entregado</ThemedText>
          </Pressable>
        )}

        {pedido.estado === 'pendiente' && (
          <Pressable
            style={[styles.actionBtn, styles.btnDanger]}
            onPress={() => cambiarEstado('cancelado')}
            disabled={cambiando}
          >
            <ThemedText style={styles.actionBtnText}>Cancelar pedido</ThemedText>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  centered: { alignItems: 'center', gap: 10, marginVertical: 20 },
  error: { color: '#b93a32' },
  sectionTitle: { marginTop: 10, fontWeight: 'bold' },
  detalleRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  actionsRow: { flexDirection: 'column', gap: 10, marginTop: 20 },
  actionBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnDanger: { backgroundColor: '#b93a32' },
  actionBtnText: { color: '#fff', fontWeight: '700' },
});