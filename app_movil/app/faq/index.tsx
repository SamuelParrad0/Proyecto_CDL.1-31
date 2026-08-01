import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { DATOS_FAQ } from '@/src/utilidades/constantes';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Habilitar animaciones en Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function FAQScreen() {
  const [expandido, setExpandido] = useState(null);

  const toggleExpandir = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(expandido === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.subtituloArriba}>— AYUDA</Text>
        <Text style={styles.titulo}>PREGUNTAS <Text style={styles.textoRojo}>FRECUENTES</Text></Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {DATOS_FAQ.map((item, index) => {
          const isExpandido = expandido === index;
          
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.tarjeta, isExpandido && styles.tarjetaExpandida]}
              onPress={() => toggleExpandir(index)}
              activeOpacity={0.8}
            >
              <View style={styles.tarjetaHeader}>
                <Text style={styles.pregunta}>{item.pregunta}</Text>
                <Text style={styles.iconoToggle}>{isExpandido ? '−' : '+'}</Text>
              </View>
              
              {isExpandido && (
                <View style={styles.respuestaContenedor}>
                  <Text style={styles.respuesta}>{item.respuesta}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.contactoContenedor}>
          <Text style={styles.contactoTitulo}>¿Aún tienes dudas?</Text>
          <Text style={styles.contactoTexto}>Contáctanos directamente a través de nuestro soporte por WhatsApp.</Text>
          <TouchableOpacity style={styles.botonContacto}>
            <IconSymbol name="phone.fill" size={18} color="#fff" />
            <Text style={styles.botonContactoTexto}>HABLAR CON SOPORTE</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  header: {
    padding: Espaciado.xl,
    alignItems: 'center',
    paddingTop: Espaciado.xxl,
  },
  subtituloArriba: {
    color: Tema.dark.tint,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: Espaciado.sm,
  },
  titulo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },
  textoRojo: {
    color: Tema.dark.tint,
    textShadowColor: 'rgba(255, 8, 68, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  scrollContent: {
    padding: Espaciado.lg,
    paddingTop: Espaciado.md,
    gap: Espaciado.md,
  },
  tarjeta: {
    backgroundColor: '#0c0c18',
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  tarjetaExpandida: {
    borderColor: 'rgba(255, 8, 68, 0.3)',
    backgroundColor: '#111120',
  },
  tarjetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.lg,
    justifyContent: 'space-between',
  },
  pregunta: {
    flex: 1,
    color: '#eae8f2',
    fontSize: 15,
    fontWeight: '700',
    paddingRight: Espaciado.md,
  },
  iconoToggle: {
    color: Tema.dark.textSecondary,
    fontSize: 24,
    fontWeight: '300',
  },
  respuestaContenedor: {
    padding: Espaciado.lg,
    paddingTop: 0,
  },
  respuesta: {
    color: Tema.dark.textSecondary,
    fontSize: 14.5,
    lineHeight: 24,
  },
  contactoContenedor: {
    marginTop: Espaciado.xl,
    padding: Espaciado.lg,
    backgroundColor: Tema.dark.surface2,
    borderRadius: RadioBorde.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Tema.dark.borderRed,
    borderStyle: 'dashed',
  },
  contactoTitulo: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Espaciado.xs,
  },
  contactoTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Espaciado.lg,
  },
  botonContacto: {
    backgroundColor: '#25D366', // Color WhatsApp
    flexDirection: 'row',
    paddingHorizontal: Espaciado.xl,
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    gap: Espaciado.sm,
  },
  botonContactoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
