import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { TIPOS_EVENTO } from '@/src/utilidades/constantes';
import servicioCitas from '@/src/servicios/servicioCitas';
import { AuthContext } from '@/src/contexto/ContextoAuth';

export default function NuevaCitaScreen() {
  const { paqueteId, paqueteNombre } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useContext(AuthContext);

  const [nombreCompleto, setNombreCompleto] = useState(usuario ? `${usuario.Nombre} ${usuario.Apellidos || ''}`.trim() : '');
  const [correo, setCorreo] = useState(usuario?.Correo || '');
  const [numeroTelefono, setNumeroTelefono] = useState(usuario?.Celular || '');
  const [tipoEvento, setTipoEvento] = useState(TIPOS_EVENTO[0]);
  const [fechaEvento, setFechaEvento] = useState(''); // Formato simple por ahora YYYY-MM-DD
  const [numeroInvitados, setNumeroInvitados] = useState('');
  const [informacionAdicional, setInformacionAdicional] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async () => {
    if (!nombreCompleto || !correo || !numeroTelefono || !fechaEvento) {
      Alert.alert('Error', 'Por favor llena todos los campos obligatorios (*)');
      return;
    }

    try {
      setCargando(true);
      await servicioCitas.crearCita({
        paqueteId: Number(paqueteId),
        nombreCompleto,
        correo,
        numeroTelefono,
        tipoEvento,
        fechaEvento,
        numeroInvitados: numeroInvitados ? Number(numeroInvitados) : null,
        informacionAdicional
      });
      
      Alert.alert(
        '¡Reserva Exitosa!', 
        'Tu cita ha sido registrada. Nos pondremos en contacto contigo pronto.',
        [{ text: 'Entendido', onPress: () => router.replace('/citas') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear la reserva');
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={styles.titulo}>Reservar <Text style={styles.textoRojo}>Paquete</Text></Text>
            <Text style={styles.subtitulo}>Estás reservando el paquete: {paqueteNombre || 'Fotográfico'}</Text>
          </View>

          <View style={styles.formContainer}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor={Tema.dark.textSecondary}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico *</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={Tema.dark.textSecondary}
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Espaciado.sm }]}>
                <Text style={styles.label}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 300 000 0000"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={numeroTelefono}
                  onChangeText={setNumeroTelefono}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Invitados</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 50"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={numeroInvitados}
                  onChangeText={setNumeroInvitados}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Evento *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tipoEvento}
                  onValueChange={(itemValue) => setTipoEvento(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={Tema.dark.tint}
                >
                  {TIPOS_EVENTO.map((tipo) => (
                    <Picker.Item key={tipo} label={tipo} value={tipo} color={Platform.OS === 'ios' ? Tema.dark.text : undefined} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha del Evento *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Tema.dark.textSecondary}
                value={fechaEvento}
                onChangeText={setFechaEvento}
              />
              <Text style={styles.ayudaTexto}>Formato: Año-Mes-Día (Ej. 2024-12-25)</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Información Adicional</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Cuéntanos más detalles sobre tu evento, locaciones preferidas o ideas específicas..."
                placeholderTextColor={Tema.dark.textSecondary}
                value={informacionAdicional}
                onChangeText={setInformacionAdicional}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.boton, cargando && styles.botonDeshabilitado]} 
              onPress={manejarEnvio}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color={Tema.dark.text} />
              ) : (
                <Text style={styles.botonTexto}>CONFIRMAR RESERVA</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Espaciado.lg,
    paddingBottom: Espaciado.xxl,
  },
  header: {
    marginBottom: Espaciado.xl,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoRojo: {
    color: Tema.dark.tint,
  },
  subtitulo: {
    fontSize: 14,
    color: Tema.dark.textSecondary,
    marginTop: Espaciado.sm,
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.lg,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: Espaciado.lg,
  },
  label: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Espaciado.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Tema.dark.surface2,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    borderRadius: RadioBorde.md,
    color: Tema.dark.text,
    padding: Espaciado.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  ayudaTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  pickerContainer: {
    backgroundColor: Tema.dark.surface2,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    borderRadius: RadioBorde.md,
    overflow: 'hidden',
  },
  picker: {
    color: Tema.dark.text,
    height: Platform.OS === 'ios' ? 150 : 50,
  },
  boton: {
    backgroundColor: Tema.dark.tint,
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    marginTop: Espaciado.md,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
    fontSize: 16,
  },
});
