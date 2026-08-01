import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { ESTADOS_CITA } from '@/src/utilidades/constantes';
import servicioCitas from '@/src/servicios/servicioCitas';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function MisSolicitudesScreen() {
  const router = useRouter();

  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarCitas = useCallback(async () => {
    try {
      const data = await servicioCitas.obtenerMisCitas();
      setCitas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar tus reservas de paquetes');
    } finally {
      setCargando(false);
    }
  }, []);

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
      '¿Estás seguro de que deseas cancelar esta reserva de paquete?',
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
              Alert.alert('Cancelada', 'La reserva ha sido cancelada correctamente.');
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo cancelar la reserva');
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  const renderCita = ({ item }) => {
    const estadoKey = (item.Estado_Reserva_Paquete || 'pendiente').toLowerCase();
    const estado = ESTADOS_CITA[estadoKey] || ESTADOS_CITA.pendiente;
    const fechaEvento = item.Fecha_Evento
      ? new Date(item.Fecha_Evento).toLocaleDateString('es-CO', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })
      : 'No especificada';
    const fechaReserva = item.Fecha_Reserva
      ? new Date(item.Fecha_Reserva).toLocaleDateString('es-CO')
      : 'Desconocida';

    return (
      <View style={styles.tarjeta}>
        {/* Header */}
        <View style={styles.tarjetaHeader}>
          <View style={styles.headerIzq}>
            <View style={styles.badgeId}>
              <Text style={styles.badgeIdTexto}>#{item.Id_Reserva_Paquete}</Text>
            </View>
            <Text style={styles.fechaReservaTexto}>Solicitado el {fechaReserva}</Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: estado.color + '20', borderColor: estado.color }]}>
            <IconSymbol name={estado.icono || 'circle.fill'} size={12} color={estado.color} />
            <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
          </View>
        </View>

        {/* Nombre del paquete */}
        {item.paquete && (
          <View style={styles.paqueteContenedor}>
            <IconSymbol name="camera.fill" size={16} color={Tema.dark.tint} />
            <Text style={styles.paqueteNombre}>
              {item.paquete?.Nombre_Paquete || 'Paquete fotográfico'}
            </Text>
            {item.paquete?.Precio_Paquete && (
              <Text style={styles.paquetePrecio}>
                ${Number(item.paquete.Precio_Paquete).toLocaleString('es-CO')}
              </Text>
            )}
          </View>
        )}

        <View style={styles.divisor} />

        {/* Datos del evento */}
        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>DATOS DEL EVENTO</Text>
          <View style={styles.filaDetalle}>
            <View style={styles.itemDetalle}>
              <IconSymbol name="calendar" size={14} color={Tema.dark.textSecondary} />
              <View>
                <Text style={styles.detalleEtiqueta}>Fecha del evento</Text>
                <Text style={styles.detalleValor} numberOfLines={2}>{fechaEvento}</Text>
              </View>
            </View>
            <View style={styles.itemDetalle}>
              <IconSymbol name="sparkles" size={14} color={Tema.dark.textSecondary} />
              <View>
                <Text style={styles.detalleEtiqueta}>Tipo de evento</Text>
                <Text style={styles.detalleValor}>{item.Tipo_Evento || 'No especificado'}</Text>
              </View>
            </View>
          </View>

          {item.Numero_Invitados ? (
            <View style={[styles.itemDetalle, { marginTop: Espaciado.sm }]}>
              <IconSymbol name="person.2.fill" size={14} color={Tema.dark.textSecondary} />
              <View>
                <Text style={styles.detalleEtiqueta}>Número de invitados</Text>
                <Text style={styles.detalleValor}>{item.Numero_Invitados}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.divisor} />

        {/* Datos del cliente */}
        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>TUS DATOS</Text>
          <View style={[styles.itemDetalle, { marginBottom: Espaciado.xs }]}>
            <IconSymbol name="person.fill" size={14} color={Tema.dark.textSecondary} />
            <Text style={styles.detalleValor}>{item.Nombre_Completo}</Text>
          </View>
          <View style={[styles.itemDetalle, { marginBottom: Espaciado.xs }]}>
            <IconSymbol name="envelope.fill" size={14} color={Tema.dark.textSecondary} />
            <Text style={styles.detalleValor}>{item.Correo}</Text>
          </View>
          <View style={styles.itemDetalle}>
            <IconSymbol name="phone.fill" size={14} color={Tema.dark.textSecondary} />
            <Text style={styles.detalleValor}>{item.Numero_Telefono || 'No especificado'}</Text>
          </View>
        </View>

        {/* Información adicional */}
        {item.Informacion_Adicional ? (
          <>
            <View style={styles.divisor} />
            <View style={styles.seccion}>
              <Text style={styles.seccionLabel}>INFORMACIÓN ADICIONAL</Text>
              <Text style={styles.infoAdicionalTexto}>{item.Informacion_Adicional}</Text>
            </View>
          </>
        ) : null}

        {/* Cancelar si está pendiente */}
        {item.Estado_Reserva_Paquete && item.Estado_Reserva_Paquete.toLowerCase() === 'pendiente' && (
          <View style={styles.tarjetaFooter}>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={() => confirmarCancelacion(item.Id_Reserva_Paquete)}
            >
              <IconSymbol name="xmark.circle" size={16} color={Tema.dark.error} />
              <Text style={styles.botonCancelarTexto}>CANCELAR RESERVA</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonAtras} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>
            Mis <Text style={styles.textoRojo}>Solicitudes</Text>
          </Text>
          <Text style={styles.subtitulo}>Historial de reservas de paquetes fotográficos</Text>
        </View>
      </View>

      {/* Contenido */}
      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : citas.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.vacioContenedor}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
        >
          <IconSymbol name="calendar.badge.exclamationmark" size={80} color={Tema.dark.borderRed} />
          <Text style={styles.vacioTitulo}>Sin reservas de paquetes</Text>
          <Text style={styles.vacioSubtitulo}>
            Aún no has reservado ningún paquete fotográfico.
          </Text>
          <TouchableOpacity
            style={styles.botonExplorar}
            onPress={() => router.push('/paquetes')}
          >
            <Text style={styles.botonExplorarTexto}>VER PAQUETES</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={citas}
          renderItem={renderCita}
          keyExtractor={(item) => item.Id_Reserva_Paquete?.toString()}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.lg,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  botonAtras: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoRojo: {
    color: Tema.dark.tint,
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lista: {
    padding: Espaciado.lg,
    gap: Espaciado.lg,
    paddingBottom: Espaciado.xxl,
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
    backgroundColor: Tema.dark.surface2,
    paddingHorizontal: Espaciado.md,
    paddingVertical: Espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  headerIzq: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.sm,
    flex: 1,
  },
  badgeId: {
    backgroundColor: 'rgba(255, 8, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RadioBorde.sm,
  },
  badgeIdTexto: {
    color: Tema.dark.tint,
    fontWeight: 'bold',
    fontSize: 11,
  },
  fechaReservaTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Espaciado.sm,
    paddingVertical: 4,
    borderRadius: RadioBorde.sm,
    borderWidth: 1,
  },
  estadoTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paqueteContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.sm,
    padding: Espaciado.md,
    backgroundColor: 'rgba(255, 8, 68, 0.06)',
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.borderRed,
  },
  paqueteNombre: {
    flex: 1,
    color: Tema.dark.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  paquetePrecio: {
    color: Tema.dark.tint,
    fontSize: 14,
    fontWeight: 'bold',
  },
  divisor: {
    height: 1,
    backgroundColor: Tema.dark.border,
    marginHorizontal: Espaciado.md,
  },
  seccion: {
    padding: Espaciado.md,
  },
  seccionLabel: {
    color: Tema.dark.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: Espaciado.sm,
    textTransform: 'uppercase',
  },
  filaDetalle: {
    flexDirection: 'row',
    gap: Espaciado.md,
  },
  itemDetalle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  detalleEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  detalleValor: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  infoAdicionalTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  tarjetaFooter: {
    padding: Espaciado.sm,
    paddingHorizontal: Espaciado.md,
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
    alignItems: 'flex-end',
  },
  botonCancelar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: Espaciado.sm,
  },
  botonCancelarTexto: {
    color: Tema.dark.error,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  vacioContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.xl,
    minHeight: 400,
  },
  vacioTitulo: {
    color: Tema.dark.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: Espaciado.lg,
    marginBottom: Espaciado.sm,
    textAlign: 'center',
  },
  vacioSubtitulo: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Espaciado.xl,
    lineHeight: 20,
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
