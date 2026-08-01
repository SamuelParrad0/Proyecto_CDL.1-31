import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { listarTodosPedidos, cambiarEstadoPedido, editarPedidoAdmin } from '@/src/servicios/servicioAdmin';
import { ESTADOS_PEDIDO } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminPedidosScreen() {
  const router = useRouter();
  const { puedeGestionarPanel, esAuxiliar } = useContext(AuthContext);

  const [pedidos, setPedidos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);

  const [detalleVisible, setDetalleVisible] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [editFormData, setEditFormData] = useState({
    direccionEnvio: '',
    telefono: '',
    notas: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!puedeGestionarPanel) {
      router.replace('/(tabs)');
      return;
    }
    cargarPedidos();
  }, [puedeGestionarPanel]);

  const cargarPedidos = async () => {
    try {
      const data = await listarTodosPedidos();
      setPedidos(data);
    } catch (error) {
      console.warn('Error de red:', error?.message || error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarPedidos();
    setRefrescando(false);
  };

  const abrirOpcionesEstado = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalVisible(true);
  };

  const actualizarEstado = async (nuevoEstado) => {
    setModalVisible(false);
    if (!pedidoSeleccionado || pedidoSeleccionado.Estado_Pedido === nuevoEstado) return;

    try {
      setCargando(true);
      await cambiarEstadoPedido(pedidoSeleccionado.id, nuevoEstado);
      await cargarPedidos();
      Alert.alert('Éxito', `Estado actualizado a: ${ESTADOS_PEDIDO[nuevoEstado].etiqueta}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
      setCargando(false);
    }
  };

  const abrirDetalle = (pedido) => {
    setPedidoDetalle(pedido);
    setDetalleVisible(true);
  };

  const abrirModalEditar = (pedido) => {
    setPedidoEditando(pedido);
    setEditFormData({
      direccionEnvio: pedido.direccionEnvio || '',
      telefono: pedido.telefono || pedido.usuario?.Celular || '',
      notas: pedido.notas || '',
    });
    setModalEditVisible(true);
  };

  const handleGuardarEdicion = async () => {
    setSaving(true);
    try {
      await editarPedidoAdmin(pedidoEditando.id, editFormData);
      setModalEditVisible(false);
      Alert.alert('Éxito', 'Pedido actualizado correctamente');
      cargarPedidos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo editar el pedido');
    } finally {
      setSaving(false);
    }
  };

  const renderPedido = ({ item }) => {
    const estadoKey = (item.estado || 'pendiente').toLowerCase();
    const estado = ESTADOS_PEDIDO[estadoKey] || ESTADOS_PEDIDO.pendiente;
    const fecha = item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-CO') : 'Sin fecha';
    console.log('Renderizando pedido:', item.id);

    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <View style={styles.badgeId}>
            <Text style={styles.badgeIdTexto}>#{item.id}</Text>
          </View>
          <Text style={styles.fecha}>Fecha: {fecha}</Text>
          <TouchableOpacity 
            style={styles.botonEditarIcono}
            onPress={() => abrirModalEditar(item)}
          >
            <IconSymbol name="pencil" size={18} color={Tema.dark.dorado || '#c9a060'} />
          </TouchableOpacity>
        </View>

        <View style={styles.tarjetaBody}>
          <View style={styles.clienteInfo}>
            <IconSymbol name="person.fill" size={16} color={Tema.dark.textSecondary} />
            <Text style={styles.clienteTexto}>{item.usuario?.Nombre || 'Usuario Desconocido'}</Text>
          </View>
          <Text style={styles.totalTexto}>Total: ${Number(item.total || 0).toLocaleString('es-CO')}</Text>
        </View>

        <View style={styles.tarjetaFooter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.labelEstado}>ESTADO ACTUAL</Text>
            <TouchableOpacity 
              style={[styles.botonEstado, { backgroundColor: estado.color + '15', borderColor: estado.color }]}
              onPress={() => abrirOpcionesEstado(item)}
            >
              <IconSymbol name={estado.icono || 'circle.fill'} size={14} color={estado.color} />
              <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
              <IconSymbol name="chevron.down" size={14} color={estado.color} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.botonAccionIcono}
            onPress={() => abrirDetalle(item)}
          >
            <IconSymbol name="doc.text.magnifyingglass" size={16} color={Tema.dark.dorado || '#c9a060'} />
            <Text style={styles.botonAccionTexto}>Ver Detalles</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const idStr = p.id?.toString() || '';
    const nombreCliente = p.usuario?.Nombre?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    const coincideBusqueda = idStr.includes(q) || nombreCliente.includes(q);
    
    // El estado del pedido suele venir en p.estado
    const estadoActual = (p.estado || 'pendiente').toLowerCase();
    const coincideEstado = filtroEstado === 'Todos' || estadoActual === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>Pedidos</Text></Text>
          <Text style={styles.subtitulo}>{pedidos.length} pedidos registrados</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={Tema.dark.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pedido por ID o cliente..."
          placeholderTextColor={Tema.dark.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={Tema.dark.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.dropdownContenedor}
        onPress={() => setModalFiltroVisible(true)}
      >
        <Text style={styles.dropdownTexto}>
          {filtroEstado === 'Todos' ? 'Todos los estados' : ESTADOS_PEDIDO[filtroEstado]?.etiqueta}
        </Text>
        <IconSymbol name="chevron.down" size={16} color={Tema.dark.textSecondary} />
      </TouchableOpacity>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={pedidosFiltrados}
          renderItem={renderPedido}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: Espaciado.xl }}>
              <Text style={{ color: Tema.dark.textSecondary }}>
                {searchQuery ? 'No se encontraron pedidos coincidentes.' : 'No hay pedidos registrados.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal para cambiar estado */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Cambiar Estado (Pedido #{pedidoSeleccionado?.id})</Text>
            
            {Object.entries(ESTADOS_PEDIDO).map(([clave, valor]) => {
              const isActive = pedidoSeleccionado?.estado === clave;
              return (
                <TouchableOpacity 
                  key={clave}
                  style={[
                    styles.opcionEstado, 
                    isActive && { borderColor: valor.color, backgroundColor: valor.color + '10' }
                  ]}
                  onPress={() => actualizarEstado(clave)}
                >
                  <View style={[styles.estadoIconContainer, { backgroundColor: isActive ? valor.color : Tema.dark.surface2 }]}>
                    <IconSymbol name={valor.icono || 'circle.fill'} size={16} color={isActive ? '#fff' : valor.color} />
                  </View>
                  <Text style={[
                    styles.opcionEstadoTexto,
                    isActive && { color: valor.color, fontWeight: 'bold' }
                  ]}>
                    {valor.etiqueta}
                  </Text>
                  {isActive && <IconSymbol name="checkmark" size={16} color={valor.color} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity 
              style={styles.botonCancelar} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.botonCancelarTexto}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para filtrar estado */}
      <Modal visible={modalFiltroVisible} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalFiltroVisible(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.modalTitulo}>Filtrar por estado</Text>
            <Text style={styles.modalSubtitulo}>Selecciona el estado que deseas visualizar.</Text>
            
            <View style={styles.opcionesEstadoContenedor}>
              <TouchableOpacity 
                style={[
                  styles.opcionEstado, 
                  filtroEstado === 'Todos' && { borderColor: Tema.dark.tint, backgroundColor: Tema.dark.tint + '10' }
                ]}
                onPress={() => { setFiltroEstado('Todos'); setModalFiltroVisible(false); }}
              >
                <View style={[styles.estadoIconContainer, { backgroundColor: filtroEstado === 'Todos' ? Tema.dark.tint : Tema.dark.surface2 }]}>
                  <IconSymbol name="list.bullet" size={16} color={filtroEstado === 'Todos' ? '#fff' : Tema.dark.textSecondary} />
                </View>
                <Text style={[styles.opcionEstadoTexto, filtroEstado === 'Todos' && { color: Tema.dark.tint, fontWeight: 'bold' }]}>
                  Todos los estados
                </Text>
                {filtroEstado === 'Todos' && <IconSymbol name="checkmark" size={16} color={Tema.dark.tint} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
              
              {Object.entries(ESTADOS_PEDIDO).map(([clave, valor]) => {
                const isActive = filtroEstado === clave;
                return (
                  <TouchableOpacity 
                    key={clave}
                    style={[
                      styles.opcionEstado, 
                      isActive && { borderColor: valor.color, backgroundColor: valor.color + '10' }
                    ]}
                    onPress={() => { setFiltroEstado(clave); setModalFiltroVisible(false); }}
                  >
                    <View style={[styles.estadoIconContainer, { backgroundColor: isActive ? valor.color : Tema.dark.surface2 }]}>
                      <IconSymbol name={valor.icono || 'circle.fill'} size={16} color={isActive ? '#fff' : valor.color} />
                    </View>
                    <Text style={[
                      styles.opcionEstadoTexto,
                      isActive && { color: valor.color, fontWeight: 'bold' }
                    ]}>
                      {valor.etiqueta}
                    </Text>
                    {isActive && <IconSymbol name="checkmark" size={16} color={valor.color} style={{ marginLeft: 'auto' }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal para ver detalles */}
      <Modal visible={detalleVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitulo}>Detalle de Pedido #{pedidoDetalle?.id}</Text>
              <TouchableOpacity onPress={() => setDetalleVisible(false)}>
                <IconSymbol name="xmark" size={24} color={Tema.dark.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {pedidoDetalle && (
              <ScrollView style={{ marginTop: Espaciado.md }} showsVerticalScrollIndicator={false}>
                <Text style={styles.seccionTitulo}>Información del Cliente</Text>
                <Text style={styles.textoDetalle}>Nombre: {pedidoDetalle.usuario?.Nombre}</Text>
                <Text style={styles.textoDetalle}>Correo: {pedidoDetalle.usuario?.Correo}</Text>
                <Text style={styles.textoDetalle}>Teléfono: {pedidoDetalle.telefono || pedidoDetalle.usuario?.Celular || 'No especificado'}</Text>
                <Text style={styles.textoDetalle}>Dirección: {pedidoDetalle.direccionEnvio || 'No especificada'}</Text>
                {pedidoDetalle.notas ? <Text style={styles.textoDetalle}>Notas: {pedidoDetalle.notas}</Text> : null}
                
                <Text style={[styles.seccionTitulo, { marginTop: Espaciado.lg }]}>Productos ({pedidoDetalle.detalles?.length || 0})</Text>
                {pedidoDetalle.detalles?.map((det, index) => (
                  <View key={index} style={styles.detalleItem}>
                    <Text style={styles.detalleProductoTexto}>{det.cantidad}x {det.producto?.Nombre_Producto || 'Producto eliminado'}</Text>
                    <Text style={styles.detallePrecioTexto}>${Number(det.subtotal).toLocaleString('es-CO')}</Text>
                  </View>
                ))}
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalValue}>${Number(pedidoDetalle.total).toLocaleString('es-CO')}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Editar Pedido */}
      <Modal visible={modalEditVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContentScroll}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitulo}>Editar Pedido #{pedidoEditando?.id}</Text>
              <TouchableOpacity onPress={() => setModalEditVisible(false)}>
                <IconSymbol name="xmark" size={24} color={Tema.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Dirección de Envío</Text>
            <TextInput
              style={styles.inputEdit}
              value={editFormData.direccionEnvio}
              onChangeText={(t) => setEditFormData({...editFormData, direccionEnvio: t})}
              placeholder="Dirección de envío"
              placeholderTextColor={Tema.dark.textSecondary}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.inputEdit}
              value={editFormData.telefono}
              onChangeText={(t) => setEditFormData({...editFormData, telefono: t})}
              placeholder="Número de teléfono"
              placeholderTextColor={Tema.dark.textSecondary}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Notas</Text>
            <TextInput
              style={[styles.inputEdit, styles.textArea]}
              value={editFormData.notas}
              onChangeText={(t) => setEditFormData({...editFormData, notas: t})}
              placeholder="Notas adicionales"
              placeholderTextColor={Tema.dark.textSecondary}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.botonGuardar, saving && {opacity: 0.7}]}
              onPress={handleGuardarEdicion}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonGuardarTexto}>GUARDAR CAMBIOS</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.lg,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  botonVolver: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoDorado: {
    color: Tema.dark.dorado || '#c9a060',
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
  },
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface,
    marginHorizontal: Espaciado.lg,
    marginTop: Espaciado.md,
    paddingHorizontal: Espaciado.md,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: Tema.dark.text,
    marginLeft: Espaciado.sm,
    fontSize: 14,
  },
  dropdownContenedor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface,
    marginHorizontal: Espaciado.lg,
    marginTop: Espaciado.sm,
    paddingHorizontal: Espaciado.md,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    height: 44,
  },
  dropdownTexto: {
    color: Tema.dark.text,
    fontSize: 14,
  },
  lista: {
    padding: Espaciado.lg,
    gap: Espaciado.md,
  },
  tarjeta: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    padding: 0,
    overflow: 'hidden',
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface2,
    paddingHorizontal: Espaciado.md,
    paddingVertical: Espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  badgeId: {
    backgroundColor: 'rgba(201, 160, 96, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RadioBorde.sm,
  },
  badgeIdTexto: {
    color: Tema.dark.dorado || '#c9a060',
    fontSize: 12,
    fontWeight: 'bold',
  },
  botonEditarIcono: {
    padding: Espaciado.xs,
  },
  fecha: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  tarjetaBody: {
    padding: Espaciado.md,
    paddingBottom: 0,
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.xs,
    marginBottom: 4,
  },
  clienteTexto: {
    color: Tema.dark.text,
    fontSize: 14,
  },
  totalTexto: {
    color: Tema.dark.tint,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Espaciado.xs,
  },
  tarjetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
    padding: Espaciado.md,
    marginTop: Espaciado.md,
  },
  labelEstado: {
    color: Tema.dark.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  botonEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Espaciado.md,
    paddingVertical: 8,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  accionesColumna: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: Espaciado.sm,
  },
  botonAccionIcono: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Espaciado.sm,
    borderRadius: RadioBorde.sm,
    backgroundColor: 'rgba(201, 160, 96, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201, 160, 96, 0.3)',
    minWidth: 90,
    justifyContent: 'center',
  },
  botonAccionTexto: {
    color: Tema.dark.dorado || '#c9a060',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContentScroll: {
    backgroundColor: Tema.dark.surface,
    borderTopLeftRadius: RadioBorde.lg,
    borderTopRightRadius: RadioBorde.lg,
    padding: Espaciado.lg,
    paddingBottom: Espaciado.xl * 2,
    borderTopWidth: 1,
    borderColor: Tema.dark.border,
  },
  label: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputEdit: {
    backgroundColor: Tema.dark.surface2,
    color: Tema.dark.text,
    borderRadius: RadioBorde.md,
    padding: Espaciado.md,
    marginBottom: Espaciado.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  botonGuardar: {
    backgroundColor: Tema.dark.tint,
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    marginTop: Espaciado.md,
  },
  botonGuardarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Tema.dark.surface,
    borderTopLeftRadius: RadioBorde.lg,
    borderTopRightRadius: RadioBorde.lg,
    padding: Espaciado.lg,
    borderTopWidth: 1,
    borderColor: Tema.dark.border,
    paddingBottom: 40,
  },
  bottomSheet: {
    backgroundColor: Tema.dark.surface,
    borderTopLeftRadius: RadioBorde.lg,
    borderTopRightRadius: RadioBorde.lg,
    padding: Espaciado.lg,
    paddingBottom: 40,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Tema.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Espaciado.lg,
  },
  modalSubtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginBottom: Espaciado.lg,
    textAlign: 'center',
  },
  opcionesEstadoContenedor: {
    marginTop: Espaciado.sm,
  },
  modalTitulo: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Espaciado.lg,
    textAlign: 'center',
  },
  opcionEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    marginBottom: Espaciado.sm,
    backgroundColor: Tema.dark.surface2,
  },
  opcionEstadoActiva: {
    borderWidth: 1,
    borderColor: Tema.dark.dorado || '#c9a060',
  },
  estadoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Espaciado.md,
  },
  opcionEstadoTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 16,
  },
  botonCancelar: {
    marginTop: Espaciado.md,
    padding: Espaciado.md,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: Tema.dark.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Espaciado.sm,
  },
  seccionTitulo: {
    color: Tema.dark.tint,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Espaciado.sm,
  },
  textoDetalle: {
    color: Tema.dark.text,
    fontSize: 14,
    marginBottom: 4,
  },
  detalleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  detalleProductoTexto: {
    color: Tema.dark.text,
    fontSize: 14,
    flex: 1,
  },
  detallePrecioTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Espaciado.md,
    paddingTop: Espaciado.sm,
    borderTopWidth: 2,
    borderTopColor: Tema.dark.border,
  },
  totalLabel: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: Tema.dark.tint,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
