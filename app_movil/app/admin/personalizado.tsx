import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { listarTodasSolicitudes, cambiarEstadoSolicitud, editarSolicitudAdmin } from '@/src/servicios/servicioAdmin';
import { ESTADOS_PERSONALIZADO } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminPersonalizadoScreen() {
  const router = useRouter();
  const { esAdmin, esAuxiliar } = useContext(AuthContext);

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  useEffect(() => {
    if (!esAdmin && !esAuxiliar) {
      router.replace('/(tabs)');
      return;
    }
    cargarSolicitudes();
  }, [esAdmin, esAuxiliar]);

  const cargarSolicitudes = async () => {
    try {
      const data = await listarTodasSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.warn('Error de red:', error?.message || error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarSolicitudes();
    setRefrescando(false);
  };

  const abrirOpcionesEstado = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalVisible(true);
  };

  const actualizarEstado = async (nuevoEstado) => {
    setModalVisible(false);
    if (!solicitudSeleccionada || solicitudSeleccionada.Estado_Personalizado === nuevoEstado) return;

    try {
      setCargando(true);
      await cambiarEstadoSolicitud(solicitudSeleccionada.Id_Personalizado, nuevoEstado);
      await cargarSolicitudes();
      Alert.alert('Éxito', `Estado actualizado correctamente`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
      setCargando(false);
    }
  };

  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [solicitudEditando, setSolicitudEditando] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombreCompleto: '',
    correo: '',
    telefono: '',
    destinatario: '',
    descripcionIdea: '',
    elementosEsenciales: '',
    prioridadCliente: '',
    comentariosAdicionales: '',
  });
  const [saving, setSaving] = useState(false);

  const abrirModalEditar = (solicitud) => {
    setSolicitudEditando(solicitud);
    setEditFormData({
      nombreCompleto: solicitud.Nombre_Completo || '',
      correo: solicitud.Correo || '',
      telefono: solicitud.Numero_Telefono || '',
      destinatario: solicitud.Destinatario || '',
      descripcionIdea: solicitud.Descripcion_Idea || '',
      elementosEsenciales: solicitud.Elementos_Esenciales || '',
      prioridadCliente: solicitud.Prioridad_Cliente || '',
      comentariosAdicionales: solicitud.Comentarios_Adicionales || '',
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
      await editarSolicitudAdmin(solicitudEditando.Id_Personalizado, editFormData);
      setModalEditVisible(false);
      Alert.alert('Éxito', 'Solicitud actualizada correctamente');
      cargarSolicitudes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo editar la solicitud');
    } finally {
      setSaving(false);
    }
  };

  // Agregar los nuevos estados si no están en constantes.js
  const estadosCompletos = {
    ...ESTADOS_PERSONALIZADO,
    'en-revision': { etiqueta: 'En revisión', color: Tema.dark.dorado || '#c9a060' },
    'aprobado': { etiqueta: 'Aprobado', color: Tema.dark.info || '#3b82f6' },
    'rechazado': { etiqueta: 'Rechazado', color: Tema.dark.error || '#ef4444' },
  };

  const renderSolicitud = ({ item }) => {
    const estado = estadosCompletos[item.Estado_Personalizado] || estadosCompletos.pendiente;
    const fechaCreacion = item.Fecha_Solicitud ? new Date(item.Fecha_Solicitud).toLocaleDateString('es-CO') : 'Desconocida';
    
    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <View style={styles.badgeId}>
            <Text style={styles.badgeIdTexto}>#{item.Id_Personalizado}</Text>
          </View>
          <Text style={styles.fechaCreacion}>{fechaCreacion}</Text>
          <TouchableOpacity
            style={styles.botonEditar}
            onPress={() => abrirModalEditar(item)}
          >
            <IconSymbol name="pencil" size={16} color={Tema.dark.dorado || '#c9a060'} />
            <Text style={styles.botonEditarTexto}>Editar</Text>
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

        <View style={styles.seccionDetalle}>
          <Text style={styles.labelEtiqueta}>DESTINATARIO</Text>
          <Text style={styles.valorTexto}>{item.Destinatario || 'No especificado'}</Text>
          
          <Text style={[styles.labelEtiqueta, { marginTop: Espaciado.md }]}>IDEA PRINCIPAL</Text>
          <Text style={styles.valorTextoBase}>{item.Descripcion_Idea}</Text>

          {item.Elementos_Esenciales ? (
            <>
              <Text style={[styles.labelEtiqueta, { marginTop: Espaciado.md }]}>ELEMENTOS ESENCIALES</Text>
              <Text style={styles.valorTextoBase}>{item.Elementos_Esenciales}</Text>
            </>
          ) : null}

          <View style={styles.filaPrioridad}>
            <Text style={styles.labelEtiqueta}>PRIORIDAD:</Text>
            <Text style={styles.valorPrioridad}>{item.Prioridad_Cliente || 'Normal'}</Text>
          </View>

          {item.Comentarios_Adicionales ? (
            <View style={styles.seccionNotas}>
              <Text style={styles.labelEtiqueta}>COMENTARIOS ADICIONALES</Text>
              <Text style={styles.notasTexto}>{item.Comentarios_Adicionales}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.tarjetaFooter}>
          <Text style={styles.labelEstado}>ESTADO ACTUAL:</Text>
          <TouchableOpacity 
            style={[styles.botonEstado, { backgroundColor: estado.color + '15', borderColor: estado.color }]}
            onPress={() => abrirOpcionesEstado(item)}
          >
            <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
            <IconSymbol name="chevron.down" size={14} color={estado.color} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Proyectos <Text style={styles.textoDorado}>Personalizados</Text></Text>
          <Text style={styles.subtitulo}>{solicitudes.length} solicitudes de ideas</Text>
        </View>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          renderItem={renderSolicitud}
          keyExtractor={(item) => item.Id_Personalizado.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContenedor}>
              <Text style={styles.emptyTexto}>No hay solicitudes personalizadas</Text>
            </View>
          }
        />
      )}

      {/* Modal para cambiar estado */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Actualizar Estado</Text>
            
            {Object.entries(estadosCompletos).map(([clave, valor]) => (
              <TouchableOpacity 
                key={clave}
                style={[
                  styles.opcionEstado, 
                  solicitudSeleccionada?.Estado_Personalizado === clave && styles.opcionEstadoActiva,
                  solicitudSeleccionada?.Estado_Personalizado === clave && { borderColor: valor.color }
                ]}
                onPress={() => actualizarEstado(clave)}
              >
                <View style={[styles.estadoDot, { backgroundColor: valor.color }]} />
                <Text style={[
                  styles.opcionEstadoTexto,
                  solicitudSeleccionada?.Estado_Personalizado === clave && { color: Tema.dark.text, fontWeight: 'bold' }
                ]}>
                  {valor.etiqueta}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.botonCancelar} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.botonCancelarTexto}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal Editar Solicitud */}
      <Modal visible={modalEditVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContentScroll}>
            <View style={styles.modalEdicionHeader}>
              <Text style={styles.modalEdicionTitulo}>Editar Solicitud #{solicitudEditando?.Id_Personalizado}</Text>
              <TouchableOpacity onPress={() => setModalEditVisible(false)}>
                <IconSymbol name="xmark" size={24} color={Tema.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre Completo *</Text>
            <TextInput style={styles.inputEdit} value={editFormData.nombreCompleto} onChangeText={(t) => setEditFormData({...editFormData, nombreCompleto: t})} placeholder="Nombre completo" placeholderTextColor={Tema.dark.textSecondary} />

            <Text style={styles.inputLabel}>Correo *</Text>
            <TextInput style={styles.inputEdit} value={editFormData.correo} onChangeText={(t) => setEditFormData({...editFormData, correo: t})} placeholder="Correo electrónico" placeholderTextColor={Tema.dark.textSecondary} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput style={styles.inputEdit} value={editFormData.telefono} onChangeText={(t) => setEditFormData({...editFormData, telefono: t})} placeholder="Número de teléfono" placeholderTextColor={Tema.dark.textSecondary} keyboardType="phone-pad" />

            <Text style={styles.inputLabel}>Destinatario</Text>
            <TextInput style={styles.inputEdit} value={editFormData.destinatario} onChangeText={(t) => setEditFormData({...editFormData, destinatario: t})} placeholder="Destinatario" placeholderTextColor={Tema.dark.textSecondary} />

            <Text style={styles.inputLabel}>Descripción de la Idea *</Text>
            <TextInput style={[styles.inputEdit, styles.textArea]} value={editFormData.descripcionIdea} onChangeText={(t) => setEditFormData({...editFormData, descripcionIdea: t})} placeholder="Describe la idea del proyecto" placeholderTextColor={Tema.dark.textSecondary} multiline numberOfLines={4} />

            <Text style={styles.inputLabel}>Elementos Esenciales</Text>
            <TextInput style={[styles.inputEdit, styles.textArea]} value={editFormData.elementosEsenciales} onChangeText={(t) => setEditFormData({...editFormData, elementosEsenciales: t})} placeholder="Elementos clave del proyecto" placeholderTextColor={Tema.dark.textSecondary} multiline numberOfLines={3} />

            <Text style={styles.inputLabel}>Prioridad del Cliente</Text>
            <TextInput style={styles.inputEdit} value={editFormData.prioridadCliente} onChangeText={(t) => setEditFormData({...editFormData, prioridadCliente: t})} placeholder="Ej. Alta, Normal, Baja" placeholderTextColor={Tema.dark.textSecondary} />

            <Text style={styles.inputLabel}>Comentarios Adicionales</Text>
            <TextInput style={[styles.inputEdit, styles.textArea]} value={editFormData.comentariosAdicionales} onChangeText={(t) => setEditFormData({...editFormData, comentariosAdicionales: t})} placeholder="Notas o comentarios adicionales" placeholderTextColor={Tema.dark.textSecondary} multiline numberOfLines={3} />

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RadioBorde.sm,
    borderWidth: 1,
    borderColor: Tema.dark.dorado || '#c9a060',
    backgroundColor: 'rgba(201, 160, 96, 0.1)',
  },
  botonEditarTexto: {
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
  modalEdicionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Espaciado.lg,
  },
  modalEdicionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Tema.dark.text,
    flex: 1,
  },
  inputLabel: {
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
  seccionDetalle: {
    padding: Espaciado.md,
  },
  labelEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  valorTexto: {
    color: Tema.dark.text,
    fontSize: 15,
    fontWeight: '500',
  },
  valorTextoBase: {
    color: Tema.dark.text,
    fontSize: 14,
    lineHeight: 20,
  },
  filaPrioridad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Espaciado.md,
  },
  valorPrioridad: {
    color: Tema.dark.dorado || '#c9a060',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  seccionNotas: {
    marginTop: Espaciado.md,
    padding: Espaciado.sm,
    backgroundColor: Tema.dark.surface2,
    borderRadius: RadioBorde.md,
  },
  notasTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
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
  modalContent: {
    backgroundColor: Tema.dark.surface,
    borderTopLeftRadius: RadioBorde.lg,
    borderTopRightRadius: RadioBorde.lg,
    padding: Espaciado.lg,
    borderTopWidth: 1,
    borderColor: Tema.dark.border,
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  opcionEstadoActiva: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  estadoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
});
