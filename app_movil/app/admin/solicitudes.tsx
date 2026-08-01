import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminSolicitudesScreen() {
  const router = useRouter();
  const { puedeGestionarPanel, esAuxiliar } = useContext(AuthContext);

  if (!puedeGestionarPanel) {
    router.replace('/(tabs)');
    return null;
  }

  const modulos = [
    {
      icono: 'shippingbox.fill',
      titulo: 'Gestión de Pedidos',
      subtitulo: 'Aprobar y enviar pedidos físicos',
      descripcion: 'Administra los pedidos realizados por los clientes, actualiza el estado de envío y seguimiento.',
      ruta: '/admin/pedidos',
      color: '#f59e0b',
    },
    {
      icono: 'calendar.badge.clock',
      titulo: 'Solicitudes de Paquetes',
      subtitulo: 'Reservas de paquetes fotográficos',
      descripcion: 'Visualiza y gestiona todas las solicitudes de reserva de paquetes: nombre, correo, teléfono, tipo de evento, fecha, invitados e información adicional del cliente.',
      ruta: '/admin/citas',
      color: '#ec4899',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonAtras} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Administración de{' '}
            <Text style={styles.textoDorado}>{esAuxiliar ? 'Auxiliar' : 'Solicitudes'}</Text>
          </Text>
          <Text style={styles.subtitulo}>Pedidos, reservas y solicitudes personalizadas</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.bannerInfo}>
          <IconSymbol name="flag.fill" size={20} color={Tema.dark.dorado || '#c9a060'} />
          <Text style={styles.bannerTexto}>
            Gestiona pedidos físicos y reservas de paquetes fotográficos de los clientes desde aquí.
          </Text>
        </View>

        <View style={styles.listaModulos}>
          {modulos.map((modulo, index) => (
            <TouchableOpacity
              key={index}
              style={styles.moduloTarjeta}
              onPress={() => router.push(modulo.ruta as any)}
              activeOpacity={0.7}
            >
              <View style={styles.moduloHeader}>
                <View style={[styles.moduloIconoContenedor, { backgroundColor: modulo.color + '18' }]}>
                  <IconSymbol name={modulo.icono} size={30} color={modulo.color} />
                </View>
                <View style={styles.moduloTituloContenedor}>
                  <Text style={styles.moduloTitulo}>{modulo.titulo}</Text>
                  <Text style={styles.moduloSubtitulo}>{modulo.subtitulo}</Text>
                </View>
                <View style={styles.flechaContenedor}>
                  <IconSymbol name="chevron.right" size={20} color={Tema.dark.textSecondary} />
                </View>
              </View>
              <View style={styles.moduloDivisor} />
              <Text style={styles.moduloDescripcion}>{modulo.descripcion}</Text>
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
  textoDorado: {
    color: Tema.dark.dorado || '#c9a060',
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  scrollContent: {
    padding: Espaciado.lg,
    paddingBottom: Espaciado.xxl,
  },
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 160, 96, 0.08)',
    padding: Espaciado.md,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 160, 96, 0.2)',
    marginBottom: Espaciado.xl,
    gap: Espaciado.sm,
  },
  bannerTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  listaModulos: {
    gap: Espaciado.md,
  },
  moduloTarjeta: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    overflow: 'hidden',
  },
  moduloHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.md,
  },
  moduloIconoContenedor: {
    width: 56,
    height: 56,
    borderRadius: RadioBorde.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Espaciado.md,
  },
  moduloTituloContenedor: {
    flex: 1,
  },
  moduloTitulo: {
    color: Tema.dark.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  moduloSubtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  flechaContenedor: {
    width: 32,
    height: 32,
    borderRadius: RadioBorde.redondo,
    backgroundColor: Tema.dark.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduloDivisor: {
    height: 1,
    backgroundColor: Tema.dark.border,
    marginHorizontal: Espaciado.md,
  },
  moduloDescripcion: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    padding: Espaciado.md,
    paddingTop: Espaciado.sm,
  },
});
