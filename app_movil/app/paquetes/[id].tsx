import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import servicioPaquetes from '@/src/servicios/servicioPaquetes';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PaqueteDetalleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [paquete, setPaquete] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const cargarDetalle = async () => {
    try {
      const data = await servicioPaquetes.obtenerPaquetePorId(id);
      setPaquete(data);
    } catch (error) {
      console.warn('Error de red:', error?.message || error);
    } finally {
      setCargando(false);
    }
  };

  const manejarReserva = () => {
    // Pasar el ID del paquete y nombre a la pantalla de nueva cita
    router.push({
      pathname: '/citas/nueva',
      params: { 
        paqueteId: paquete.Id_Paquete,
        paqueteNombre: paquete.Nombre_Paquete
      }
    });
  };

  if (cargando) {
    return (
      <View style={styles.cargandoContenedor}>
        <ActivityIndicator size="large" color={Tema.dark.tint} />
      </View>
    );
  }

  if (!paquete) {
    return (
      <View style={styles.cargandoContenedor}>
        <Text style={{ color: Tema.dark.text }}>Paquete no encontrado</Text>
      </View>
    );
  }

  const precio = Number(paquete.Precio_Paquete).toLocaleString('es-CO');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        
        <ImageBackground
          source={{ uri: paquete.Imagen_Paquete || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' }}
          style={styles.heroImagen}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.badgeContenedor}>
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>Premium</Text>
              </View>
            </View>
            <Text style={styles.heroTitulo}>{paquete.Nombre_Paquete}</Text>
          </View>
        </ImageBackground>

        <View style={styles.contenido}>
          <View style={styles.precioContenedor}>
            <Text style={styles.precioEtiqueta}>Inversión Total</Text>
            <Text style={styles.precioValor}>${precio}</Text>
          </View>

          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Descripción del Servicio</Text>
            <Text style={styles.descripcionTexto}>{paquete.Descripcion_Paquete}</Text>
          </View>

          {/* Como el backend no tiene beneficios como array estructurado por defecto,
              mostramos un listado genérico de beneficios CDL basado en el frontend */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>¿Qué incluye?</Text>
            
            <View style={styles.beneficioItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={Tema.dark.tint} />
              <Text style={styles.beneficioTexto}>Atención personalizada por profesionales</Text>
            </View>
            <View style={styles.beneficioItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={Tema.dark.tint} />
              <Text style={styles.beneficioTexto}>Equipos de alta resolución y tecnología</Text>
            </View>
            <View style={styles.beneficioItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={Tema.dark.tint} />
              <Text style={styles.beneficioTexto}>Entrega en formatos digitales optimizados</Text>
            </View>
            <View style={styles.beneficioItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={Tema.dark.tint} />
              <Text style={styles.beneficioTexto}>Asesoría en locaciones y vestuario</Text>
            </View>
          </View>

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.botonReserva} onPress={manejarReserva}>
          <Text style={styles.botonReservaTexto}>RESERVAR AHORA</Text>
          <IconSymbol name="calendar.badge.plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Tema.dark.background,
  },
  scrollContent: {
    paddingBottom: Espaciado.xxl,
  },
  heroImagen: {
    width: '100%',
    height: 300,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 3, 8, 0.6)',
    justifyContent: 'flex-end',
    padding: Espaciado.lg,
  },
  badgeContenedor: {
    alignItems: 'flex-start',
    marginBottom: Espaciado.sm,
  },
  badge: {
    backgroundColor: Tema.dark.tint,
    paddingHorizontal: Espaciado.md,
    paddingVertical: 4,
    borderRadius: RadioBorde.sm,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  heroTitulo: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  contenido: {
    padding: Espaciado.lg,
  },
  precioContenedor: {
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.lg,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.borderRed,
    alignItems: 'center',
    marginBottom: Espaciado.xl,
    marginTop: -40, // Sobrepone la tarjeta a la imagen hero
  },
  precioEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Espaciado.xs,
  },
  precioValor: {
    color: Tema.dark.tint,
    fontSize: 32,
    fontWeight: 'bold',
  },
  seccion: {
    marginBottom: Espaciado.xl,
  },
  seccionTitulo: {
    color: Tema.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Espaciado.md,
  },
  descripcionTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  beneficioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Espaciado.sm,
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  beneficioTexto: {
    color: Tema.dark.text,
    fontSize: 14,
    marginLeft: Espaciado.sm,
    flex: 1,
  },
  footer: {
    padding: Espaciado.lg,
    backgroundColor: Tema.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.borderRed,
  },
  botonReserva: {
    backgroundColor: Tema.dark.tint,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    gap: Espaciado.sm,
  },
  botonReservaTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
