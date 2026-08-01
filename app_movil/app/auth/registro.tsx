import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/contexto/ContextoAuth';
import { Tema, Espaciado, RadioBorde } from '../../constants/tema';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { registro, cargando } = useContext(AuthContext);

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [celular, setCelular] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errorLocal, setErrorLocal] = useState('');

  const manejarRegistro = async () => {
    setErrorLocal('');
    if (!nombre || !correo || !contraseña || !confirmarPassword) {
      setErrorLocal('Nombre, correo y contraseñas son obligatorios');
      return;
    }
    if (contraseña !== confirmarPassword) {
      setErrorLocal('Las contraseñas no coinciden');
      return;
    }
    if (contraseña.length < 6) {
      setErrorLocal('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await registro({
        nombre,
        apellidos,
        correo,
        celular,
        contraseña,
      });
      // El _layout raíz se encargará de redirigir si la sesión cambia
      router.replace('/(tabs)');
    } catch (error) {
      setErrorLocal(error.message || 'Error al registrar usuario');
      Alert.alert('Error de registro', error.message || 'Verifica los datos ingresados');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerContainer}>
            <Text style={styles.titulo}>Crear <Text style={styles.textoRojo}>Cuenta</Text></Text>
            <Text style={styles.subtitulo}>Únete a CDL y reserva tus momentos especiales.</Text>
          </View>

          <View style={styles.formContainer}>
            {errorLocal ? <Text style={styles.errorText}>{errorLocal}</Text> : null}

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Espaciado.sm }]}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Juan"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Apellidos</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Pérez"
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={apellidos}
                  onChangeText={setApellidos}
                />
              </View>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Celular</Text>
              <TextInput
                style={styles.input}
                placeholder="+57 300 000 0000"
                placeholderTextColor={Tema.dark.textSecondary}
                value={celular}
                onChangeText={setCelular}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Tema.dark.textSecondary}
                value={contraseña}
                onChangeText={setContraseña}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Tema.dark.textSecondary}
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.boton, cargando && styles.botonDeshabilitado]} 
              onPress={manejarRegistro}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color={Tema.dark.text} />
              ) : (
                <Text style={styles.botonTexto}>CREAR CUENTA</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.linkText}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>

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
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Espaciado.xl,
  },
  titulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Tema.dark.text,
    marginBottom: Espaciado.sm,
  },
  textoRojo: {
    color: Tema.dark.tint,
  },
  subtitulo: {
    fontSize: 14,
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Espaciado.lg,
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
  errorText: {
    color: Tema.dark.error,
    fontSize: 14,
    marginBottom: Espaciado.md,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: Tema.dark.tint,
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    marginTop: Espaciado.sm,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Espaciado.xl,
  },
  footerText: {
    color: Tema.dark.textSecondary,
  },
  linkText: {
    color: Tema.dark.tint,
    fontWeight: 'bold',
  },
});
