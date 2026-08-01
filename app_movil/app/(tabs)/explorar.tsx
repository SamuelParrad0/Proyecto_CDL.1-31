import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ExplorarScreen() {
  const router = useRouter();

  const secciones = [
    {
      id: 'paquetes',
      titulo: 'Paquetes Fotográficos',
      subtitulo: 'Sesiones de boda, eventos y retratos',
      icono: 'camera.fill',
      ruta: '/paquetes',
      imagen: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'
    },
    {
      id: 'galeria',
      titulo: 'Galería de Trabajos',
      subtitulo: 'Inspírate con nuestras mejores fotos',
      icono: 'photo.on.rectangle.angled',
      ruta: '/galeria',
      imagen: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'
    },

    {
      id: 'faq',
      titulo: 'Preguntas Frecuentes',
      subtitulo: 'Resuelve tus dudas sobre nuestros servicios',
      icono: 'questionmark.circle.fill',
      ruta: '/faq',
      imagen: null
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Explora <Text style={styles.tituloDestacado}>CDL</Text></Text>
          <Text style={styles.subtitulo}>Descubre todo lo que podemos hacer por ti.</Text>
        </View>

        <View style={styles.listaSecciones}>
          {secciones.map((seccion) => (
            <TouchableOpacity 
              key={seccion.id}
              style={[styles.tarjeta, !seccion.imagen && styles.tarjetaSinImagen]}
              onPress={() => router.push(seccion.ruta as any)}
              activeOpacity={0.8}
            >
              {seccion.imagen ? (
                <ImageBackground 
                  source={{ uri: seccion.imagen }} 
                  style={styles.fondoImagen}
                  imageStyle={styles.imagenBorde}
                >
                  <View style={styles.overlayOscuro}>
                    <View style={styles.contenidoTarjeta}>
                      <View style={styles.iconoContenedor}>
                        <IconSymbol name={seccion.icono} size={24} color={Tema.dark.tint} />
                      </View>
                      <View style={styles.textoContenedor}>
                        <Text style={styles.tarjetaTitulo}>{seccion.titulo}</Text>
                        <Text style={styles.tarjetaSubtitulo}>{seccion.subtitulo}</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={Tema.dark.textSecondary} />
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={styles.contenidoTarjeta}>
                  <View style={styles.iconoContenedor}>
                    <IconSymbol name={seccion.icono} size={24} color={Tema.dark.tint} />
                  </View>
                  <View style={styles.textoContenedor}>
                    <Text style={styles.tarjetaTitulo}>{seccion.titulo}</Text>
                    <Text style={styles.tarjetaSubtitulo}>{seccion.subtitulo}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={Tema.dark.textSecondary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  scrollContent: {
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
  tituloDestacado: {
    color: Tema.dark.tint,
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginTop: Espaciado.xs,
  },
  listaSecciones: {
    gap: Espaciado.md,
  },
  tarjeta: {
    height: 120,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    shadowColor: Tema.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  tarjetaSinImagen: {
    backgroundColor: Tema.dark.surface,
    height: 'auto',
    paddingVertical: Espaciado.md,
  },
  fondoImagen: {
    flex: 1,
  },
  imagenBorde: {
    borderRadius: RadioBorde.lg,
  },
  overlayOscuro: {
    flex: 1,
    backgroundColor: 'rgba(3, 3, 8, 0.75)',
    borderRadius: RadioBorde.lg,
  },
  contenidoTarjeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.lg,
  },
  iconoContenedor: {
    width: 48,
    height: 48,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Tema.dark.borderRed,
  },
  textoContenedor: {
    flex: 1,
    marginLeft: Espaciado.md,
  },
  tarjetaTitulo: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarjetaSubtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
});
