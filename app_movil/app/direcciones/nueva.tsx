import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import servicioDirecciones from '@/src/servicios/servicioDirecciones';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function NuevaDireccionScreen() {
  const { editarId } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useContext(AuthContext);

  const [nombreCompleto, setNombreCompleto] = useState(usuario ? `${usuario.Nombre} ${usuario.Apellidos || ''}`.trim() : '');
  const [direccionCompleta, setDireccionCompleta] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [barrio, setBarrio] = useState('');
  const [apartamentoCasa, setApartamentoCasa] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState(usuario?.Celular || '');
  const [indicaciones, setIndicaciones] = useState('');
  const [residenciaLaboral, setResidenciaLaboral] = useState('Residencia');
  
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(!!editarId);

  useEffect(() => {
    if (editarId) {
      cargarDireccion();
    }
  }, [editarId]);

  const cargarDireccion = async () => {
    try {
      // Como no hay endpoint individual de dirección en nuestro mockup de backend original,
      // tenemos que obtener la lista y filtrar
      const direcciones = await servicioDirecciones.obtenerMisDirecciones();
      const dir = direcciones.find(d => d.Id_Direccion.toString() === editarId.toString());
      
      if (dir) {
        setNombreCompleto(dir.Nombre_Completo);
        setDireccionCompleta(dir.Direccion_Completa);
        setDepartamento(dir.Departamento);
        setMunicipio(dir.Municipio_Localidad);
        setBarrio(dir.Barrio);
        setApartamentoCasa(dir.Apartamento_Casa || '');
        setTelefonoContacto(dir.Telefono_Contacto);
        setIndicaciones(dir.Indicaciones_Adicionales || '');
        setResidenciaLaboral(dir.Residencia_Laboral || 'Residencia');
      } else {
        Alert.alert('Error', 'No se encontró la dirección');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la dirección');
      router.back();
    } finally {
      setCargandoDatos(false);
    }
  };

  const manejarEnvio = async () => {
    if (!nombreCompleto || !direccionCompleta || !departamento || !municipio || !barrio || !telefonoContacto) {
      Alert.alert('Error', 'Por favor llena todos los campos obligatorios (*)');
      return;
    }

    try {
      setCargando(true);
      const datos = {
        nombreCompleto,
        direccion: direccionCompleta,
        departamento,
        municipioLocalidad: municipio,
        barrio,
        apartCasa: apartamentoCasa,
        telefono: telefonoContacto,
        indicaciones,
        residenciaLaboral
      };

      if (editarId) {
        await servicioDirecciones.editarDireccion(editarId, datos);
        Alert.alert('Éxito', 'Dirección actualizada correctamente', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await servicioDirecciones.crearDireccion(datos);
        Alert.alert('Éxito', 'Dirección creada correctamente', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo guardar la dirección');
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator size="large" color={Tema.dark.tint} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
            </TouchableOpacity>
            <Text style={styles.titulo}>{editarId ? 'Editar' : 'Nueva'} <Text style={styles.textoRojo}>Dirección</Text></Text>
          </View>

          <View style={styles.formContainer}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Quien Recibe *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={Tema.dark.textSecondary}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono de Contacto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 300 000 0000"
                placeholderTextColor={Tema.dark.textSecondary}
                value={telefonoContacto}
                onChangeText={setTelefonoContacto}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Espaciado.sm }]}>
                <Text style={styles.label}>Departamento *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Antioquia"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={departamento}
                  onChangeText={setDepartamento}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Municipio *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Medellín"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={municipio}
                  onChangeText={setMunicipio}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Espaciado.sm }]}>
                <Text style={styles.label}>Barrio *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. El Poblado"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={barrio}
                  onChangeText={setBarrio}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Apto/Casa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Opcional"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={apartamentoCasa}
                  onChangeText={setApartamentoCasa}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección Completa *</Text>
              <TextInput
                style={styles.input}
                placeholder="Calle 10 # 40-50"
                placeholderTextColor={Tema.dark.textSecondary}
                value={direccionCompleta}
                onChangeText={setDireccionCompleta}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Indicaciones Adicionales</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Dejar en portería, casa verde de dos pisos..."
                placeholderTextColor={Tema.dark.textSecondary}
                value={indicaciones}
                onChangeText={setIndicaciones}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Dirección</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={residenciaLaboral}
                  onValueChange={(itemValue) => setResidenciaLaboral(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={Tema.dark.tint}
                >
                  <Picker.Item label="Residencia" value="Residencia" color={Platform.OS === 'ios' ? Tema.dark.text : undefined} />
                  <Picker.Item label="Laboral" value="Laboral" color={Platform.OS === 'ios' ? Tema.dark.text : undefined} />
                </Picker>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.boton, cargando && styles.botonDeshabilitado]} 
              onPress={manejarEnvio}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color={Tema.dark.text} />
              ) : (
                <>
                  <IconSymbol name="square.and.arrow.down.fill" size={18} color="#fff" />
                  <Text style={styles.botonTexto}>{editarId ? 'ACTUALIZAR' : 'GUARDAR'}</Text>
                </>
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
  centrado: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: Espaciado.lg,
    paddingBottom: Espaciado.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Espaciado.xl,
  },
  botonVolver: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoRojo: {
    color: Tema.dark.tint,
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
    minHeight: 80,
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
    flexDirection: 'row',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Espaciado.sm,
    gap: Espaciado.sm,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 16,
  },
});
