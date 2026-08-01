import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { PRIORIDADES_PERSONALIZADO } from '@/src/utilidades/constantes';
import servicioPersonalizado from '@/src/servicios/servicioPersonalizado';
import { AuthContext } from '@/src/contexto/ContextoAuth';

export default function NuevoPersonalizadoScreen() {
  const router = useRouter();
  const { usuario } = useContext(AuthContext);

  const [nombreCompleto, setNombreCompleto] = useState(usuario ? `${usuario.Nombre} ${usuario.Apellidos || ''}`.trim() : '');
  const [correo, setCorreo] = useState(usuario?.Correo || '');
  const [numeroTelefono, setNumeroTelefono] = useState(usuario?.Celular || '');
  const [destinatario, setDestinatario] = useState('');
  const [descripcionIdea, setDescripcionIdea] = useState('');
  const [elementosEsenciales, setElementosEsenciales] = useState('');
  const [prioridadCliente, setPrioridadCliente] = useState(PRIORIDADES_PERSONALIZADO[0]);
  const [comentariosAdicionales, setComentariosAdicionales] = useState('');

  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async () => {
    if (!nombreCompleto || !correo || !numeroTelefono || !descripcionIdea || !destinatario) {
      Alert.alert('Error', 'Por favor llena todos los campos obligatorios (*)');
      return;
    }

    try {
      setCargando(true);
      await servicioPersonalizado.crearPersonalizado({
        nombreCompleto,
        correo,
        numeroTelefono,
        destinatario,
        descripcionIdea,
        elementosEsenciales,
        prioridadCliente,
        comentariosAdicionales
      });

      Alert.alert(
        '¡Solicitud Enviada!',
        'Hemos recibido tu idea. Nos pondremos en contacto contigo pronto para hacerla realidad.',
        [{ text: 'Ver mis solicitudes', onPress: () => router.replace('/personalizado') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo enviar la solicitud');
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
            <Text style={styles.titulo}>Proyecto <Text style={styles.textoRojo}>Personalizado</Text></Text>
            <Text style={styles.subtitulo}>Cuéntanos tu idea y la haremos realidad.</Text>
          </View>

          <View style={styles.formContainer}>

            <View style={styles.seccionTitulo}>
              <Text style={styles.seccionTexto}>Tus Datos</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                placeholderTextColor={Tema.dark.textSecondary}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Espaciado.sm }]}>
                <Text style={styles.label}>Correo *</Text>
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
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="300 000 0000"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={numeroTelefono}
                  onChangeText={setNumeroTelefono}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.seccionTitulo}>
              <Text style={styles.seccionTexto}>Detalles de tu Idea</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>¿Para quién es? (Destinatario) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. Mi pareja, Mi madre, Yo mismo..."
                placeholderTextColor={Tema.dark.textSecondary}
                value={destinatario}
                onChangeText={setDestinatario}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Describe tu Idea *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Cuéntanos con detalle qué tienes en mente..."
                placeholderTextColor={Tema.dark.textSecondary}
                value={descripcionIdea}
                onChangeText={setDescripcionIdea}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Elementos Esenciales</Text>
              <TextInput
                style={[styles.input, styles.textArea, { minHeight: 80 }]}
                placeholder="Ej. Fotos específicas, colores, frases..."
                placeholderTextColor={Tema.dark.textSecondary}
                value={elementosEsenciales}
                onChangeText={setElementosEsenciales}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prioridad Principal</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={prioridadCliente}
                  onValueChange={(itemValue) => setPrioridadCliente(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={Tema.dark.tint}
                >
                  {PRIORIDADES_PERSONALIZADO.map((prioridad) => (
                    <Picker.Item key={prioridad} label={prioridad} value={prioridad} color={Platform.OS === 'ios' ? Tema.dark.text : undefined} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Comentarios Adicionales</Text>
              <TextInput
                style={[styles.input, styles.textArea, { minHeight: 80 }]}
                placeholder="Cualquier otro detalle que debamos saber..."
                placeholderTextColor={Tema.dark.textSecondary}
                value={comentariosAdicionales}
                onChangeText={setComentariosAdicionales}
                multiline
                numberOfLines={3}
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
                <Text style={styles.botonTexto}>ENVIAR SOLICITUD</Text>
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
  seccionTitulo: {
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.borderRed,
    paddingBottom: Espaciado.xs,
    marginBottom: Espaciado.md,
    marginTop: Espaciado.sm,
  },
  seccionTexto: {
    color: Tema.dark.tint,
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
