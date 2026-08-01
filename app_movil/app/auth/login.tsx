import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/contexto/ContextoAuth';
import { Tema, Espaciado, RadioBorde } from '../../constants/tema';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login, cargando } = useContext(AuthContext);

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorLocal, setErrorLocal] = useState('');

  const manejarLogin = async () => {
    setErrorLocal('');
    if (!correo || !password) {
      setErrorLocal('Por favor ingresa tu correo y contraseña');
      return;
    }

    try {
      await login(correo, password);
      // El _layout raíz se encargará de redirigir si la sesión cambia
      router.replace('/(tabs)');
    } catch (error) {
      setErrorLocal(error.message || 'Error al iniciar sesión');
      Alert.alert('Error de acceso', error.message || 'Verifica tus credenciales');
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
            <Text style={styles.logo}>CDL <Text style={styles.logoRojo}>FOTOGRAFÍA</Text></Text>
            <Text style={styles.subtitulo}>Accede a tu cuenta para gestionar tus pedidos y citas.</Text>
          </View>

          <View style={styles.formContainer}>
            {errorLocal ? <Text style={styles.errorText}>{errorLocal}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
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
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Tema.dark.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.boton, cargando && styles.botonDeshabilitado]} 
              onPress={manejarLogin}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color={Tema.dark.text} />
              ) : (
                <Text style={styles.botonTexto}>INICIAR SESIÓN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/registro')}>
                <Text style={styles.linkText}>Regístrate aquí</Text>
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
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Tema.dark.text,
    letterSpacing: 2,
    marginBottom: Espaciado.sm,
  },
  logoRojo: {
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
