import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { usuario, puedeGestionarPanel, esAdmin, esAuxiliar } = useContext(AuthContext);

  if (!puedeGestionarPanel) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={60} color={Tema.dark.error} />
        <Text style={styles.errorTexto}>Acceso Denegado</Text>
        <Text style={styles.errorSubtexto}>No tienes permisos para ver esta pantalla.</Text>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.botonVolverTexto}>VOLVER A LA TIENDA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categorias = [
    {
      icono: 'person.2.fill',
      titulo: 'Gestión de\nUsuarios',
      subtitulo: 'Roles y permisos',
      ruta: '/admin/usuarios',
      color: '#3b82f6',
    },
    {
      icono: 'tag.fill',
      titulo: 'Gestión de\nCategorías',
      subtitulo: 'Catálogo organizado',
      ruta: '/admin/categorias',
      color: '#22c55e',
    },
    {
      icono: 'doc.text.fill',
      titulo: 'Administración\nde Contenidos',
      subtitulo: 'Productos de la plataforma',
      ruta: '/admin/contenidos',
      color: '#c9a060',
    },
    {
      icono: 'flag.fill',
      titulo: 'Administración\nde Solicitudes',
      subtitulo: 'Pedidos físicos y citas',
      ruta: '/admin/solicitudes',
      color: '#a855f7',
    },
    {
      icono: 'shippingbox.fill',
      titulo: 'Gestión de\nPedidos',
      subtitulo: 'Actualizar estados y seguimiento',
      ruta: '/admin/pedidos',
      color: '#f59e0b',
    },
    {
      icono: 'calendar.badge.clock',
      titulo: 'Solicitudes de\nPaquetes',
      subtitulo: 'Gestionar reservas y citas',
      ruta: '/admin/citas',
      color: '#ec4899',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonAtras} onPress={() => router.replace('/(tabs)')}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.titulo}>Panel de Administración</Text>
          <Text style={styles.subtitulo}>Bienvenido, {usuario?.Nombre}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.resumenGrid}>
          <View style={styles.resumenTarjeta}>
            <Text style={styles.resumenNumero}>12</Text>
            <Text style={styles.resumenEtiqueta}>Pedidos Nuevos</Text>
          </View>
        </View>

        <View style={styles.resumenTarjetaSecundario}>
          <Text style={styles.resumenEtiqueta}>Resumen de gestión</Text>
          <Text style={styles.resumenTexto}>Desde aquí puedes administrar los módulos clave de la app.</Text>
          <View style={styles.listaResumen}>
            <Text style={styles.itemResumen}>• Usuarios: editar perfiles y cambiar estados de acceso.</Text>
            <Text style={styles.itemResumen}>• Contenidos: administrar productos y paquetes disponibles.</Text>
            <Text style={styles.itemResumen}>• Pedidos y citas: actualizar estados y dar seguimiento.</Text>
          </View>
        </View>

        <Text style={styles.seccionTitulo}>Módulos de Gestión</Text>

        <View style={styles.listaCategorias}>
          {categorias.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoriaBarra}
              onPress={() => router.push(cat.ruta as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.categoriaIconoContenedor, { backgroundColor: cat.color + '18' }]}>
                <IconSymbol name={cat.icono} size={28} color={cat.color} />
              </View>
              <View style={styles.categoriaInfo}>
                <Text style={styles.categoriaTitulo}>{cat.titulo.replace('\n', ' ')}</Text>
                <Text style={styles.categoriaSubtitulo}>{cat.subtitulo}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={Tema.dark.textSecondary} />
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
  errorContainer: {
    flex: 1,
    backgroundColor: Tema.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.xl,
  },
  errorTexto: {
    color: Tema.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: Espaciado.lg,
    marginBottom: Espaciado.sm,
  },
  errorSubtexto: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Espaciado.xl,
  },
  botonVolver: {
    backgroundColor: Tema.dark.tint,
    paddingHorizontal: Espaciado.xl,
    paddingVertical: Espaciado.md,
    borderRadius: RadioBorde.md,
  },
  botonVolverTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.lg,
    gap: Espaciado.sm,
  },
  headerContent: {
    flex: 1,
  },
  botonAtras: {
    padding: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  botonTienda: {
    backgroundColor: 'rgba(201, 160, 96, 0.16)',
    borderColor: 'rgba(201, 160, 96, 0.35)',
    borderWidth: 1,
    paddingHorizontal: Espaciado.sm,
    paddingVertical: Espaciado.xs,
    borderRadius: RadioBorde.md,
  },
  botonTiendaTexto: {
    color: Tema.dark.dorado || '#c9a060',
    fontSize: 12,
    fontWeight: '700',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoDorado: {
    color: Tema.dark.dorado || '#c9a060',
  },
  subtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  scrollContent: {
    padding: Espaciado.lg,
    paddingTop: 0,
    paddingBottom: Espaciado.xxl,
  },
  resumenGrid: {
    flexDirection: 'row',
    gap: Espaciado.md,
    marginBottom: Espaciado.xl,
  },
  resumenTarjeta: {
    flex: 1,
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.lg,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 160, 96, 0.3)', // Borde dorado sutil
    alignItems: 'center',
  },
  resumenTarjetaSecundario: {
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.lg,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.2)',
    marginBottom: Espaciado.lg,
  },
  resumenNumero: {
    color: Tema.dark.dorado || '#c9a060',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: Espaciado.xs,
  },
  resumenEtiqueta: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  resumenTexto: {
    color: Tema.dark.text,
    fontSize: 14,
    marginTop: Espaciado.xs,
  },
  listaResumen: {
    marginTop: Espaciado.sm,
    gap: Espaciado.xs,
  },
  itemResumen: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  seccionTitulo: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Espaciado.md,
  },
  listaCategorias: {
    gap: Espaciado.md,
  },
  categoriaBarra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.md,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  categoriaIconoContenedor: {
    width: 50,
    height: 50,
    borderRadius: RadioBorde.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Espaciado.md,
  },
  categoriaInfo: {
    flex: 1,
  },
  categoriaTitulo: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  categoriaSubtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
});
