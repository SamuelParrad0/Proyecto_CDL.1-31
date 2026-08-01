import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { listarTodasCitas, cambiarEstadoCita, editarCitaAdmin } from '@/src/servicios/servicioAdmin';
import { ESTADOS_CITA } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminCitasScreen() {
  const router = useRouter();
  const { puedeGestionarPanel } = useContext(AuthContext);

  const [citas, setCitas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);

  useEffect(() => {
    if (!puedeGestionarPanel) {
      router.replace('/(tabs)');
      return;
    }
    cargarCitas();
  }, [puedeGestionarPanel]);

  const cargarCitas = async () => {
    try {
      const data = await listarTodasCitas();
      setCitas(data);
    } catch (error) {
      console.warn('Error de red:', error?.message || error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarCitas();
    setRefrescando(false);
  };

  const abrirOpcionesEstado = (cita) => {
    setCitaSeleccionada(cita);
    setModalVisible(true);
  };

  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    tipoEvento: '',
    fechaEvento: '',
    numeroInvitados: '',
    informacionAdicional: ''
  });
  const [saving, setSaving] = useState(false);

  const abrirModalEditar = (cita) => {
    setCitaEditando(cita);
    setEditFormData({
      nombreCompleto: cita.Nombre_Completo || '',
      correo: cita.Correo || '',
      telefono: cita.Numero_Telefono || '',
      tipoEvento: cita.Tipo_Evento || '',
      fechaEvento: cita.Fecha_Evento ? new Date(cita.Fecha_Evento).toISOString().split('T')[0] : '',
      numeroInvitados: cita.Numero_Invitados ? String(cita.Numero_Invitados) : '',
      informacionAdicional: cita.Informacion_Adicional || ''
    });
    setModalEditVisible(true);
  };

  const handleGuardarEdicion = async () => {
    if (!editFormData.nombreCompleto || !editFormData.correo) {
      Alert.alert('Atención', 'Nombre y correo son obligatorios');
      return;
    }
    setSaving(true);
    try {
      await editarCitaAdmin(citaEditando.Id_Reserva_Paquete, editFormData);
      setModalEditVisible(false);
      Alert.alert('Éxito', 'Cita actualizada correctamente');
      cargarCitas();
    } catch (error) {
      Alert.alert('Error', 'No se pudo editar la cita');
    } finally {
      setSaving(false);
    }
  };

  const actualizarEstado = async (nuevoEstado) => {
    setModalVisible(false);
    const estadoActual = (citaSeleccionada?.Estado_Reserva_Paquete || '').toLowerCase();
    if (!citaSeleccionada || estadoActual === nuevoEstado) return;

    try {
      setCargando(true);
      await cambiarEstadoCita(citaSeleccionada.Id_Reserva_Paquete, nuevoEstado);
      await cargarCitas();
      Alert.alert('✅ Éxito', `Estado actualizado a: ${ESTADOS_CITA[nuevoEstado]?.etiqueta || nuevoEstado}`);
    } catch (error) {
      const mensaje = error?.message || 'Error desconocido';
      Alert.alert('❌ Error', `No se pudo actualizar el estado.\n${mensaje}`);
      setCargando(false);
    }
  };



  const formatearMoneda = (valor) => {
    if (!valor) return '$0';
    return '$' + Number(valor).toLocaleString('es-CO');
  };

  const renderCita = ({ item }) => {
    const estado = ESTADOS_CITA[item.Estado_Reserva_Paquete] || ESTADOS_CITA.pendiente;
    const fechaEvento = item.Fecha_Evento ? new Date(item.Fecha_Evento).toLocaleDateString('es-CO') : 'No especificada';
    const fechaCreacion = item.Fecha_Reserva ? new Date(item.Fecha_Reserva).toLocaleDateString('es-CO') : 'Desconocida';
    
    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <View style={styles.badgeId}>
            <Text style={styles.badgeIdTexto}>#{item.Id_Reserva_Paquete}</Text>
          </View>
          <Text style={styles.fechaCreacion}>Solicitado: {fechaCreacion}</Text>
          <TouchableOpacity 
            style={styles.botonEditar}
            onPress={() => abrirModalEditar(item)}
          >
            <IconSymbol name="pencil" size={18} color={Tema.dark.dorado || '#c9a060'} />
          </TouchableOpacity>
        </View>

        <View style={styles.seccionCliente}>
          <Text style={styles.clienteNombre}>{item.Nombre_Completo}</Text>
          <View style={styles.filaInfo}>
            <IconSymbol name="envelope.fill" size={14} color={Tema.dark.textSecondary} />
            <Text style={styles.clienteContacto}>{item.Correo}</Text>
          </View>
          <View style={styles.filaInfo}>
            <IconSymbol name="phone.fill" size={14} color={Tema.dark.textSecondary} />
            <Text style={styles.clienteContacto}>{item.Numero_Telefono}</Text>
          </View>
        </View>

        <View style={styles.divisor} />

        <View style={styles.seccionEvento}>
          <View style={styles.filaEvento}>
            <View style={styles.colEvento}>
              <Text style={styles.labelEtiqueta}>TIPO DE EVENTO</Text>
              <Text style={styles.valorEvento}>{item.Tipo_Evento}</Text>
            </View>
            <View style={styles.colEvento}>
              <Text style={styles.labelEtiqueta}>FECHA EVENTO</Text>
              <Text style={styles.valorEvento}>{fechaEvento}</Text>
            </View>
            <View style={styles.colEvento}>
              <Text style={styles.labelEtiqueta}>INVITADOS</Text>
              <Text style={styles.valorEvento}>{item.Numero_Invitados || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divisor} />

        <View style={styles.seccionPaquete}>
          <Text style={styles.labelEtiqueta}>PAQUETE SOLICITADO</Text>
          <View style={styles.cajaPaquete}>
            <Text style={styles.paqueteNombre}>{item.paquete?.Nombre_Paquete || 'Paquete Desconocido'}</Text>
            <Text style={styles.paquetePrecio}>{formatearMoneda(item.paquete?.Precio_Paquete)}</Text>
          </View>
        </View>

        {item.Informacion_Adicional ? (
          <>
            <View style={styles.divisor} />
            <View style={styles.seccionNotas}>
              <Text style={styles.labelEtiqueta}>INFORMACIÓN ADICIONAL</Text>
              <Text style={styles.notasTexto}>{item.Informacion_Adicional}</Text>
            </View>
          </>
        ) : null}

        <View style={styles.tarjetaFooter}>
          <Text style={styles.labelEstado}>ESTADO ACTUAL:</Text>
          <TouchableOpacity 
            style={[styles.botonEstado, { backgroundColor: estado.color + '15', borderColor: estado.color }]}
            onPress={() => abrirOpcionesEstado(item)}
          >
            <IconSymbol name={estado.icono || 'circle.fill'} size={14} color={estado.color} />
            <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
            <IconSymbol name="chevron.down" size={14} color={estado.color} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const citasFiltradas = citas.filter(c => {
    const idStr = c.Id_Reserva_Paquete?.toString() || '';
    const nombreCliente = c.Nombre_Completo?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    const coincideBusqueda = idStr.includes(q) || nombreCliente.includes(q);
    const coincideEstado = filtroEstado === 'Todos' || c.Estado_Reserva_Paquete === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>Citas</Text></Text>
          <Text style={styles.subtitulo}>{citas.length} solicitudes de reservas</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={Tema.dark.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cita por ID o cliente..."
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
          {filtroEstado === 'Todos' ? 'Todos los estados' : ESTADOS_CITA[filtroEstado]?.etiqueta}
        </Text>
        <IconSymbol name="chevron.down" size={16} color={Tema.dark.textSecondary} />
      </TouchableOpacity>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={citasFiltradas}
          renderItem={renderCita}
          keyExtractor={(item) => item.Id_Reserva_Paquete.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContenedor}>
              <Text style={styles.emptyTexto}>
                {searchQuery ? 'No se encontraron citas coincidentes.' : 'No hay citas registradas'}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal para cambiar estado */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.modalTitulo}>Actualizar Estado</Text>
            <Text style={styles.modalSubtitulo}>Selecciona el nuevo estado para esta reserva.</Text>
            
            <View style={styles.opcionesEstadoContenedor}>
              {Object.entries(ESTADOS_CITA).map(([clave, valor]) => {
                const isActive = citaSeleccionada?.Estado_Reserva_Paquete === clave;
                return (
                  <TouchableOpacity 
                    key={clave}
                    style={[
                      styles.opcionEstado, 
                      isActive && styles.opcionEstadoActiva,
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
            </View>
          </View>
        </TouchableOpacity>
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
              
              {Object.entries(ESTADOS_CITA).map(([clave, valor]) => {
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

      {/* Modal Editar Cita */}
      <Modal visible={modalEditVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContentScroll}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Editar Cita</Text>
              <TouchableOpacity onPress={() => setModalEditVisible(false)}>
                <IconSymbol name="xmark" size={24} color={Tema.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput style={styles.input} value={editFormData.nombreCompleto} onChangeText={(t) => setEditFormData({...editFormData, nombreCompleto: t})} placeholderTextColor={Tema.dark.textSecondary} />

            <Text style={styles.label}>Correo *</Text>
            <TextInput style={styles.input} value={editFormData.correo} onChangeText={(t) => setEditFormData({...editFormData, correo: t})} placeholderTextColor={Tema.dark.textSecondary} keyboardType="email-address" />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput style={styles.input} value={editFormData.telefono} onChangeText={(t) => setEditFormData({...editFormData, telefono: t})} placeholderTextColor={Tema.dark.textSecondary} keyboardType="phone-pad" />

            <Text style={styles.label}>Tipo de Evento</Text>
            <TextInput style={styles.input} value={editFormData.tipoEvento} onChangeText={(t) => setEditFormData({...editFormData, tipoEvento: t})} placeholderTextColor={Tema.dark.textSecondary} />

            <View style={{flexDirection: 'row', gap: 10}}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={editFormData.fechaEvento} onChangeText={(t) => setEditFormData({...editFormData, fechaEvento: t})} placeholderTextColor={Tema.dark.textSecondary} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Invitados</Text>
                <TextInput style={styles.input} value={editFormData.numeroInvitados} onChangeText={(t) => setEditFormData({...editFormData, numeroInvitados: t})} placeholderTextColor={Tema.dark.textSecondary} keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.label}>Información Adicional</Text>
            <TextInput style={[styles.input, styles.textArea]} value={editFormData.informacionAdicional} onChangeText={(t) => setEditFormData({...editFormData, informacionAdicional: t})} placeholderTextColor={Tema.dark.textSecondary} multiline numberOfLines={3} />

            <TouchableOpacity style={[styles.botonGuardar, saving && {opacity: 0.7}]} onPress={handleGuardarEdicion} disabled={saving}>
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
  emptyContenedor: {
    padding: Espaciado.xl,
    alignItems: 'center',
  },
  emptyTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 16,
  },
  tarjeta: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    padding: 0,
    overflow: 'hidden',
    marginBottom: Espaciado.md,
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
    fontWeight: 'bold',
    fontSize: 12,
  },
  fechaCreacion: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  botonEditar: {
    padding: 4,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Espaciado.lg,
  },
  label: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Tema.dark.surface2,
    color: Tema.dark.text,
    borderRadius: RadioBorde.md,
    padding: Espaciado.md,
    marginBottom: Espaciado.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
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
  seccionCliente: {
    padding: Espaciado.md,
  },
  clienteNombre: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  clienteContacto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
  },
  divisor: {
    height: 1,
    backgroundColor: Tema.dark.border,
    marginHorizontal: Espaciado.md,
  },
  seccionEvento: {
    padding: Espaciado.md,
  },
  filaEvento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colEvento: {
    flex: 1,
  },
  labelEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  valorEvento: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  seccionPaquete: {
    padding: Espaciado.md,
  },
  cajaPaquete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface2,
    padding: Espaciado.sm,
    borderRadius: RadioBorde.md,
    marginTop: 4,
  },
  paqueteNombre: {
    color: Tema.dark.text,
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  paquetePrecio: {
    color: Tema.dark.exito || '#22c55e',
    fontSize: 15,
    fontWeight: 'bold',
  },
  seccionNotas: {
    padding: Espaciado.md,
  },
  notasTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  tarjetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface2,
    padding: Espaciado.md,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
  },
  labelEstado: {
    color: Tema.dark.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  botonEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Espaciado.md,
    paddingVertical: 8,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    gap: 6,
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Tema.dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Espaciado.xl,
    paddingTop: Espaciado.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: Tema.dark.border,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Tema.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Espaciado.lg,
  },
  modalTitulo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginBottom: Espaciado.xl,
  },
  opcionesEstadoContenedor: {
    gap: Espaciado.sm,
  },
  opcionEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  opcionEstadoActiva: {
    // Fondo y borde se setean dinámicamente
  },
  estadoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Espaciado.md,
  },
  opcionEstadoTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 15,
  },
});
