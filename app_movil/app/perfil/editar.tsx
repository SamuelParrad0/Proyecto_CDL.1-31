import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { IconSymbol } from '@/components/ui/IconSymbol';

type CampoEditable = 'correo' | 'telefono' | 'password' | null;

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { usuario, actualizarPerfil } = useContext(AuthContext);

  const [campoEditando, setCampoEditando] = useState<CampoEditable>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(false);

  const abrirModal = (campo: CampoEditable) => {
    setValores({});
    setCampoEditando(campo);
  };

  const cerrarModal = () => {
    setCampoEditando(null);
    setValores({});
  };

  const procesarCambioCorreo = async () => {
    if (!valores.nuevo?.trim()) {
      Alert.alert('Error', 'Ingresa el nuevo correo');
      return;
    }
    if (valores.nuevo !== valores.confirmar) {
      Alert.alert('Error', 'Los correos no coinciden');
      return;
    }
    await actualizarPerfil({ correo: valores.nuevo });
    Alert.alert('¡Éxito!', 'Correo actualizado correctamente');
    cerrarModal();
  };

  const procesarCambioTelefono = async () => {
    if (!valores.nuevo?.trim()) {
      Alert.alert('Error', 'Ingresa el nuevo teléfono');
      return;
    }
    await actualizarPerfil({ celular: valores.nuevo });
    Alert.alert('¡Éxito!', 'Teléfono actualizado correctamente');
    cerrarModal();
  };

  const procesarCambioPassword = async () => {
    if (!valores.actual?.trim()) {
      Alert.alert('Error', 'Ingresa la contraseña actual');
      return;
    }
    if ((valores.nueva || '').length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (valores.nueva !== valores.confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    await actualizarPerfil({ 
      passwordActual: valores.actual, 
      passwordNuevo: valores.nueva 
    });
    Alert.alert('¡Éxito!', 'Contraseña actualizada correctamente');
    cerrarModal();
  };

  const guardarCambio = async () => {
    try {
      setCargando(true);
      if (campoEditando === 'correo') await procesarCambioCorreo();
      else if (campoEditando === 'telefono') await procesarCambioTelefono();
      else if (campoEditando === 'password') await procesarCambioPassword();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar');
    } finally {
      setCargando(false);
    }
  };

  const configCampos: Record<string, { titulo: string; campos: { id: string; label: string; placeholder: string; secureText?: boolean; keyboard?: string }[] }> = {
    correo: {
      titulo: 'Cambiar Correo Electrónico',
      campos: [
        { id: 'nuevo', label: 'Nuevo correo', placeholder: 'nuevo@correo.com', keyboard: 'email-address' },
        { id: 'confirmar', label: 'Confirmar correo', placeholder: 'nuevo@correo.com', keyboard: 'email-address' },
      ],
    },
    telefono: {
      titulo: 'Cambiar Teléfono',
      campos: [
        { id: 'nuevo', label: 'Nuevo teléfono', placeholder: '+57 300 000 0000', keyboard: 'phone-pad' },
      ],
    },
    password: {
      titulo: 'Cambiar Contraseña',
      campos: [
        { id: 'actual', label: 'Contraseña actual', placeholder: '••••••••', secureText: true },
        { id: 'nueva', label: 'Nueva contraseña', placeholder: 'Mínimo 6 caracteres', secureText: true },
        { id: 'confirmar', label: 'Confirmar contraseña', placeholder: 'Repite la contraseña', secureText: true },
      ],
    },
  };

  const filasEditables = [
    { campo: 'correo' as CampoEditable, icono: 'envelope.fill', label: 'Correo Electrónico', valor: usuario?.Correo || '—' },
    { campo: 'telefono' as CampoEditable, icono: 'phone.fill', label: 'Teléfono', valor: usuario?.Celular || '—' },
    { campo: 'password' as CampoEditable, icono: 'lock.fill', label: 'Contraseña', valor: '••••••••••' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
          </TouchableOpacity>
          <View style={styles.headerTextos}>
            <View style={styles.headerIconRow}>
              <IconSymbol name="person.text.rectangle.fill" size={26} color={Tema.dark.tint} />
              <View>
                <Text style={styles.etiquetaCategoria}>— Configuración</Text>
                <Text style={styles.titulo}>Datos de tu <Text style={styles.textoRojo}>Cuenta</Text></Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.gridDosColumnas}>
          <View style={styles.campoSoloLectura}>
            <Text style={styles.labelRojo}>Nombre</Text>
            <Text style={styles.valorSoloLectura}>{usuario?.Nombre || '—'}</Text>
          </View>
          <View style={styles.campoSoloLectura}>
            <Text style={styles.labelRojo}>Apellido</Text>
            <Text style={styles.valorSoloLectura}>{usuario?.Apellidos || '—'}</Text>
          </View>
        </View>

        {filasEditables.map((fila) => (
          <View key={fila.campo} style={styles.filaEditable}>
            <View style={styles.filaInfo}>
              <View style={styles.filaLabelRow}>
                <IconSymbol name={fila.icono} size={14} color={Tema.dark.tint} />
                <Text style={styles.filaLabel}>{fila.label}</Text>
              </View>
              <Text style={styles.filaValor}>{fila.valor}</Text>
            </View>
            <TouchableOpacity 
              style={styles.btnModificar} 
              onPress={() => abrirModal(fila.campo)}
              activeOpacity={0.7}
            >
              <IconSymbol name="pencil" size={12} color={Tema.dark.tint} />
              <Text style={styles.btnModificarTexto}>Modificar</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>

      <Modal visible={campoEditando !== null} transparent animationType="fade" onRequestClose={cerrarModal}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={cerrarModal}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCaja}>
              <TouchableOpacity style={styles.modalCerrar} onPress={cerrarModal}>
                <Text style={styles.modalCerrarTexto}>×</Text>
              </TouchableOpacity>

              <View style={styles.modalCabecera}>
                <View style={styles.accentLine} />
                <Text style={styles.modalTitulo}>{campoEditando ? configCampos[campoEditando]?.titulo : ''}</Text>
                <Text style={styles.modalSubtitulo}>Seguridad y Personalización de Cuenta</Text>
              </View>

              <View style={styles.modalCampos}>
                {campoEditando && configCampos[campoEditando]?.campos.map((campo) => (
                  <View key={campo.id} style={styles.modalCampoGrupo}>
                    <Text style={styles.modalCampoLabel}>{campo.label}</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder={campo.placeholder}
                      placeholderTextColor={Tema.dark.textSecondary}
                      secureTextEntry={campo.secureText}
                      keyboardType={campo.keyboard as any || 'default'}
                      autoCapitalize="none"
                      value={valores[campo.id] || ''}
                      onChangeText={(text) => setValores(prev => ({ ...prev, [campo.id]: text }))}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.modalBotones}>
                <TouchableOpacity style={styles.modalBtnCancelar} onPress={cerrarModal}>
                  <Text style={styles.modalBtnCancelarTexto}>Descartar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtnGuardar, cargando && { opacity: 0.7 }]} onPress={guardarCambio} disabled={cargando}>
                  {cargando ? <ActivityIndicator color="#fff" size="small" /> : (
                    <>
                      <Text style={styles.modalBtnGuardarTexto}>Guardar Cambios</Text>
                      <IconSymbol name="checkmark.shield.fill" size={16} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Tema.dark.background },
  scrollContent: { flexGrow: 1, padding: Espaciado.lg, paddingBottom: Espaciado.xxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Espaciado.xl, paddingBottom: Espaciado.lg, borderBottomWidth: 1, borderBottomColor: Tema.dark.border },
  botonVolver: { padding: Espaciado.sm, marginRight: Espaciado.sm, marginLeft: -Espaciado.sm },
  headerTextos: { flex: 1 },
  headerIconRow: { flexDirection: 'row', alignItems: 'center', gap: Espaciado.sm },
  etiquetaCategoria: { fontSize: 11, fontWeight: '700', color: Tema.dark.tint, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: Tema.dark.text },
  textoRojo: { color: Tema.dark.tint },
  gridDosColumnas: { flexDirection: 'row', gap: Espaciado.md, marginBottom: Espaciado.lg },
  campoSoloLectura: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderWidth: 1, borderColor: Tema.dark.border, borderRadius: RadioBorde.lg, padding: Espaciado.md },
  labelRojo: { fontSize: 11, fontWeight: '700', color: Tema.dark.tint, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  valorSoloLectura: { fontSize: 16, fontWeight: '500', color: Tema.dark.text },
  filaEditable: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.01)', borderWidth: 1, borderColor: Tema.dark.border, borderRadius: RadioBorde.xl, padding: Espaciado.md, paddingHorizontal: Espaciado.lg, marginBottom: Espaciado.md },
  filaInfo: { flex: 1, gap: 4 },
  filaLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filaLabel: { fontSize: 11, fontWeight: '700', color: Tema.dark.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 },
  filaValor: { fontSize: 15, color: Tema.dark.text, marginTop: 2 },
  btnModificar: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Tema.dark.borderRed, borderRadius: RadioBorde.md, paddingVertical: 8, paddingHorizontal: 14 },
  btnModificarTexto: { fontSize: 12, fontWeight: '700', color: Tema.dark.tint, textTransform: 'uppercase', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', padding: Espaciado.lg },
  modalCaja: { width: '100%', maxWidth: 400, backgroundColor: '#07070f', borderWidth: 1, borderColor: 'rgba(255, 8, 68, 0.25)', borderRadius: 24, padding: Espaciado.xl },
  modalCerrar: { position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalCerrarTexto: { color: Tema.dark.textSecondary, fontSize: 20, lineHeight: 22 },
  modalCabecera: { marginBottom: Espaciado.xl },
  accentLine: { width: 40, height: 3, backgroundColor: Tema.dark.tint, marginBottom: Espaciado.md, borderRadius: 2 },
  modalTitulo: { fontSize: 24, fontWeight: 'bold', color: Tema.dark.text, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  modalSubtitulo: { fontSize: 11, fontWeight: '600', color: Tema.dark.textSecondary, textTransform: 'uppercase', letterSpacing: 2 },
  modalCampos: { gap: Espaciado.lg, marginBottom: Espaciado.xl },
  modalCampoGrupo: { gap: 6 },
  modalCampoLabel: { fontSize: 11, fontWeight: '700', color: Tema.dark.tint, textTransform: 'uppercase', letterSpacing: 2 },
  modalInput: { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: RadioBorde.lg, padding: Espaciado.md, color: Tema.dark.text, fontSize: 15 },
  modalBotones: { flexDirection: 'row', gap: Espaciado.md },
  modalBtnCancelar: { flex: 1, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: RadioBorde.lg, padding: Espaciado.md, alignItems: 'center' },
  modalBtnCancelarTexto: { color: Tema.dark.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  modalBtnGuardar: { flex: 2, backgroundColor: Tema.dark.tint, borderRadius: RadioBorde.lg, padding: Espaciado.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modalBtnGuardarTexto: { color: '#fff', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});