import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { ESTADOS_PERSONALIZADO } from '@/src/utilidades/constantes';
import servicioPersonalizado from '@/src/servicios/servicioPersonalizado';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function MisSolicitudesScreen() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarSolicitudes = async () => {
    try {
      const data = await servicioPersonalizado.obtenerMisSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.warn('Error de red:', error?.message || error);
      Alert.alert('Error', 'No se pudieron cargar tus solicitudes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarSolicitudes();
    setRefrescando(false);
  };

  const confirmarCancelacion = (id) => {
    Alert.alert(
      'Cancelar Solicitud',
      '¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer.',
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCargando(true);
              await servicioPersonalizado.cancelarSolicitud(id);
              await cargarSolicitudes();
              Alert.alert('Éxito', 'La solicitud ha sido cancelada.');
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo cancelar la solicitud');
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  const renderSolicitud = ({ item }) => {
    const estadoKey = (item.Estado_Personalizado || 'pendiente').toLowerCase();
    const estado = ESTADOS_PERSONALIZADO[estadoKey] || ESTADOS_PERSONALIZADO.pendiente;
    const fecha = new Date(item.Fecha_Solicitud).toLocaleDateString('es-CO');

    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <Text style={styles.fecha}>{fecha}</Text>
          <View style={[styles.badge, { backgroundColor: estado.color + '20', borderColor: estado.color }]}>
            <Text style={[styles.badgeTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
          </View>
        </View>

        <View style={styles.tarjetaBody}>
          <Text style={styles.destinatario}><Text style={styles.label}>Destinatario:</Text> {item.Destinatario}</Text>
          <Text style={styles.ideaTexto} numberOfLines={3}>{item.Descripcion_Idea}</Text>

          <View style={styles.prioridadContenedor}>
            <IconSymbol name="flag.fill" size={12} color={Tema.dark.textSecondary} />
            <Text style={styles.prioridadTexto}>{item.Prioridad_Cliente}</Text>
          </View>
        </View>

        {item.Estado_Personalizado && item.Estado_Personalizado.toLowerCase() === 'pendiente' && (
          <View style={styles.tarjetaFooter}>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={() => confirmarCancelacion(item.Id_Personalizado)}
            >
              <IconSymbol name="xmark.circle" size={16} color={Tema.dark.error} />
              <Text style={styles.botonCancelarTexto}>CANCELAR SOLICITUD</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis <Text style={styles.textoRojo}>Solicitudes</Text></Text>
        <Text style={styles.subtitulo}>Proyectos personalizados y regalos a medida.</Text>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : solicitudes.length === 0 ? (
        <View style={styles.vacioContenedor}>
          <IconSymbol name="wand.and.stars" size={80} color={Tema.dark.borderRed} />
          <Text style={styles.vacioTitulo}>No tienes solicitudes</Text>
          <Text style={styles.vacioSubtitulo}>Aún no has solicitado ningún proyecto personalizado.</Text>
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          renderItem={renderSolicitud}
          keyExtractor={(item) => item.Id_Personalizado.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.botonNuevo}
          onPress={() => router.push('/personalizado/nueva')}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
          <Text style={styles.botonNuevoTexto}>NUEVA SOLICITUD</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tema.dark.background,
  },
  header: {
    padding: Espaciado.lg,
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
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginTop: Espaciado.xs,
  },
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lista: {
    padding: Espaciado.lg,
    paddingTop: 0,
    gap: Espaciado.md,
  },
  tarjeta: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    overflow: 'hidden',
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Espaciado.md,
    backgroundColor: Tema.dark.surface2,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  fecha: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: Espaciado.sm,
    paddingVertical: 4,
    borderRadius: RadioBorde.sm,
    borderWidth: 1,
  },
  badgeTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tarjetaBody: {
    padding: Espaciado.md,
  },
  destinatario: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Espaciado.sm,
  },
  label: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
  },
  ideaTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: Espaciado.md,
  },
  prioridadContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prioridadTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tarjetaFooter: {
    padding: Espaciado.sm,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
    alignItems: 'flex-end',
  },
  botonCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.sm,
    gap: 4,
  },
  botonCancelarTexto: {
    color: Tema.dark.error,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  vacioContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.xl,
  },
  vacioTitulo: {
    color: Tema.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: Espaciado.lg,
    marginBottom: Espaciado.sm,
  },
  vacioSubtitulo: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: Espaciado.lg,
    backgroundColor: Tema.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.borderRed,
  },
  botonNuevo: {
    backgroundColor: Tema.dark.tint,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    gap: Espaciado.sm,
  },
  botonNuevoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
