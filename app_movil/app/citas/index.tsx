import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { ESTADOS_CITA } from '@/src/utilidades/constantes';
import servicioCitas from '@/src/servicios/servicioCitas';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function MisCitasScreen() {
  const router = useRouter();
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarCitas = async () => {
    try {
      const data = await servicioCitas.obtenerMisCitas();
      setCitas(data);
    } catch (error) {
      console.warn('Error de red:', error?.message || error);
      Alert.alert('Error', 'No se pudieron cargar tus citas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarCitas();
    setRefrescando(false);
  };

  const confirmarCancelacion = (id) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que deseas cancelar esta cita?',
      [
        { text: 'No, mantener', style: 'cancel' },
        { 
          text: 'Sí, cancelar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCargando(true);
              await servicioCitas.cancelarCita(id);
              await cargarCitas();
              Alert.alert('Éxito', 'La cita ha sido cancelada');
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo cancelar la cita');
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  const renderCita = ({ item }) => {
    const estado = ESTADOS_CITA[item.Estado_Reserva_Paquete] || ESTADOS_CITA.pendiente;
    // Backend devuelve Fecha_Evento y Fecha_Reserva en formato ISO o YYYY-MM-DD
    const fecha = new Date(item.Fecha_Evento).toLocaleDateString('es-CO', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <View style={styles.tipoEventoContenedor}>
            <IconSymbol name="calendar" size={16} color={Tema.dark.textSecondary} />
            <Text style={styles.tipoEvento}>{item.Tipo_Evento}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: estado.color + '20', borderColor: estado.color }]}>
            <Text style={[styles.badgeTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
          </View>
        </View>

        <View style={styles.tarjetaBody}>
          <Text style={styles.fecha}>{fecha}</Text>
          
          <View style={styles.detalleFila}>
            <Text style={styles.detalleEtiqueta}>Paquete ID:</Text>
            <Text style={styles.detalleValor}>#{item.Id_Paquete}</Text>
          </View>
          
          <View style={styles.detalleFila}>
            <Text style={styles.detalleEtiqueta}>Invitados:</Text>
            <Text style={styles.detalleValor}>{item.Numero_Invitados || 'No especificado'}</Text>
          </View>

          {item.Precio_Total && (
            <View style={styles.detalleFila}>
              <Text style={styles.detalleEtiqueta}>Total Estimado:</Text>
              <Text style={styles.precioValor}>${Number(item.Precio_Total).toLocaleString('es-CO')}</Text>
            </View>
          )}
        </View>

        {item.Estado_Reserva_Paquete === 'pendiente' && (
          <View style={styles.tarjetaFooter}>
            <TouchableOpacity 
              style={styles.botonCancelar}
              onPress={() => confirmarCancelacion(item.Id_Reserva_Paquete)}
            >
              <Text style={styles.botonCancelarTexto}>CANCELAR RESERVA</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis <Text style={styles.textoRojo}>Citas</Text></Text>
        <Text style={styles.subtitulo}>Historial de reservas de paquetes fotográficos.</Text>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : citas.length === 0 ? (
        <View style={styles.vacioContenedor}>
          <IconSymbol name="calendar.badge.exclamationmark" size={80} color={Tema.dark.borderRed} />
          <Text style={styles.vacioTitulo}>No tienes citas</Text>
          <Text style={styles.vacioSubtitulo}>Aún no has reservado ningún paquete fotográfico.</Text>
          <TouchableOpacity 
            style={styles.botonExplorar}
            onPress={() => router.push('/paquetes')}
          >
            <Text style={styles.botonExplorarTexto}>VER PAQUETES</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={citas}
          renderItem={renderCita}
          keyExtractor={(item) => item.Id_Reserva_Paquete.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
        />
      )}
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
  tipoEventoContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.xs,
  },
  tipoEvento: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
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
  fecha: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: Espaciado.md,
  },
  detalleFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Espaciado.xs,
  },
  detalleEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
  },
  detalleValor: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  precioValor: {
    color: Tema.dark.tint,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tarjetaFooter: {
    padding: Espaciado.md,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
  },
  botonCancelar: {
    alignItems: 'center',
    padding: Espaciado.sm,
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
    marginBottom: Espaciado.xl,
  },
  botonExplorar: {
    backgroundColor: Tema.dark.tint,
    paddingHorizontal: Espaciado.xl,
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
  },
  botonExplorarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
