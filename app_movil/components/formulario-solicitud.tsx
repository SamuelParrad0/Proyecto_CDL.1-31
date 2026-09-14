import React, { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';

type LayoutProps = Readonly<{ titulo: ReactNode; subtitulo: string; children: ReactNode }>;
type CampoProps = Readonly<{ label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: TextInputProps['keyboardType']; autoCapitalize?: TextInputProps['autoCapitalize']; multiline?: boolean; numberOfLines?: number; minHeight?: number; helperText?: string; containerStyle?: StyleProp<ViewStyle> }>;
type SelectorProps = Readonly<{ label: string; value: string; options: readonly string[]; onChange: (value: string) => void }>;
type SubmitProps = Readonly<{ cargando: boolean; texto: string; onPress: () => void }>;

export function FormularioSolicitudLayout({ titulo, subtitulo, children }: LayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}><Text style={styles.titulo}>{titulo}</Text><Text style={styles.subtitulo}>{subtitulo}</Text></View>
          <View style={styles.formContainer}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function CampoTextoFormulario({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, multiline, numberOfLines, minHeight, helperText, containerStyle }: CampoProps) {
  const inputStyle = multiline ? [styles.input, styles.textArea, minHeight ? { minHeight } : undefined] : styles.input;
  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={inputStyle} placeholder={placeholder} placeholderTextColor={Tema.dark.textSecondary} value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize} multiline={multiline} numberOfLines={numberOfLines} textAlignVertical={multiline ? 'top' : undefined} />
      {helperText && <Text style={styles.ayudaTexto}>{helperText}</Text>}
    </View>
  );
}

export function SelectorFormulario({ label, value, options, onChange }: SelectorProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}><Picker selectedValue={value} onValueChange={onChange} style={styles.picker} dropdownIconColor={Tema.dark.tint}>{options.map((option) => <Picker.Item key={option} label={option} value={option} color={Platform.OS === 'ios' ? Tema.dark.text : undefined} />)}</Picker></View>
    </View>
  );
}

export function BotonEnvioFormulario({ cargando, texto, onPress }: SubmitProps) {
  return <TouchableOpacity style={[styles.boton, cargando && styles.botonDeshabilitado]} onPress={onPress} disabled={cargando}>{cargando ? <ActivityIndicator color={Tema.dark.text} /> : <Text style={styles.botonTexto}>{texto}</Text>}</TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Tema.dark.background },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Espaciado.lg, paddingBottom: Espaciado.xxl },
  header: { marginBottom: Espaciado.xl },
  titulo: { fontSize: 28, fontWeight: 'bold', color: Tema.dark.text },
  subtitulo: { fontSize: 14, color: Tema.dark.textSecondary, marginTop: Espaciado.sm, lineHeight: 20 },
  formContainer: { backgroundColor: Tema.dark.surface, padding: Espaciado.lg, borderRadius: RadioBorde.lg, borderWidth: 1, borderColor: Tema.dark.border },
  inputGroup: { marginBottom: Espaciado.lg },
  label: { color: Tema.dark.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Espaciado.xs, fontWeight: '600' },
  input: { backgroundColor: Tema.dark.surface2, color: Tema.dark.text, borderRadius: RadioBorde.md, padding: Espaciado.md, borderWidth: 1, borderColor: Tema.dark.border, fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: Tema.dark.surface2, borderRadius: RadioBorde.md, borderWidth: 1, borderColor: Tema.dark.border, overflow: 'hidden' },
  picker: { color: Tema.dark.text, height: 50 },
  boton: { backgroundColor: Tema.dark.tint, padding: Espaciado.md, borderRadius: RadioBorde.md, alignItems: 'center', marginTop: Espaciado.md },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: Tema.dark.text, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  ayudaTexto: { color: Tema.dark.textSecondary, fontSize: 11, marginTop: 4 },
});
