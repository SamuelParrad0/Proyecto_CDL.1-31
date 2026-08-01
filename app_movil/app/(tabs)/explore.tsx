import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function CuentaScreen() {
  const router = useRouter();
  const { usuario, estaAutenticado, esAdmin, esAuxiliar, puedeGestionarPanel, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const OpcionMenu = ({ icono, titulo, subtitulo, onPress, colorIcono = Tema.dark.tint }: { icono: any, titulo: string, subtitulo?: string, onPress: () => void, colorIcono?: string }) => (
    <TouchableOpacity style={styles.opcionMenu} onPress={onPress}>
      <View style={[styles.iconoContenedor, { borderColor: colorIcono === Tema.dark.tint ? Tema.dark.borderRed : Tema.dark.border }]}>
        <IconSymbol name={icono} size={22} color={colorIcono} />
      </View>
      <View style={styles.textoContenedor}>
        <Text style={styles.opcionTitulo}>{titulo}</Text>
        {subtitulo && <Text style={styles.opcionSubtitulo}>{subtitulo}</Text>}
      </View>
      <IconSymbol name="chevron.right" size={20} color={Tema.dark.textSecondary} />
    </TouchableOpacity>
  );

  if (!estaAutenticado) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.noAuthContenedor}>
          <IconSymbol name="person.crop.circle.badge.exclamationmark" size={80} color={Tema.dark.borderRed} />
          <Text style={styles.noAuthTitulo}>Bienvenido a CDL</Text>
          <Text style={styles.noAuthSubtitulo}>Inicia sesión para gestionar tus pedidos y guardar tus direcciones.</Text>
          
          <TouchableOpacity style={styles.botonPrimario} onPress={() => router.push('/auth/login')}>
            <Text style={styles.botonPrimarioTexto}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.botonSecundario} onPress={() => router.push('/auth/registro')}>
            <Text style={styles.botonSecundarioTexto}>CREAR CUENTA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.perfilHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{usuario?.Nombre?.charAt(0) || 'U'}</Text>
          </View>
          <View style={styles.perfilInfo}>
            <Text style={styles.perfilNombre}>{usuario?.Nombre} {usuario?.Apellidos}</Text>
            <Text style={styles.perfilCorreo}>{usuario?.Correo}</Text>
            {(esAdmin || esAuxiliar) && (
              <View style={styles.badgeAdmin}>
                <Text style={styles.badgeAdminTexto}>{esAuxiliar ? 'AUXILIAR' : 'ADMINISTRADOR'}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Mi Actividad</Text>
          <View style={styles.tarjeta}>
            <OpcionMenu 
              icono="bag.fill" 
              titulo="Mis Pedidos" 
              subtitulo="Productos físicos solicitados"
              onPress={() => router.push('/pedidos/mis-pedidos')} 
            />
            <View style={styles.separador} />
            <OpcionMenu 
              icono="calendar.badge.clock" 
              titulo="Mis Solicitudes" 
              subtitulo="Paquetes y servicios reservados"
              onPress={() => router.push('/citas/mis-solicitudes')} 
              colorIcono="#ec4899"
            />
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Configuración</Text>
          <View style={styles.tarjeta}>
            <OpcionMenu 
              icono="person.fill" 
              titulo="Editar Perfil" 
              onPress={() => router.push('/perfil/editar')} 
            />
            <View style={styles.separador} />
            <OpcionMenu 
              icono="map.fill" 
              titulo="Mis Direcciones" 
              onPress={() => router.push('/direcciones')} 
            />
          </View>
        </View>

        {puedeGestionarPanel && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Administración</Text>
            <View style={styles.tarjeta}>
              <OpcionMenu 
                icono="lock.shield.fill" 
                titulo={esAuxiliar ? 'Panel de Auxiliar' : 'Panel de Administración'} 
                subtitulo={esAuxiliar ? 'Gestionar pedidos, citas y solicitudes' : 'Gestionar tienda y reservas'}
                colorIcono={Tema.dark.dorado || '#c9a060'}
                onPress={() => router.push('/admin/dashboard')} 
              />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.botonSalir} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={Tema.dark.error} />
          <Text style={styles.botonSalirTexto}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

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
  perfilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Espaciado.xl,
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.lg,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Tema.dark.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Tema.dark.tint,
  },
  avatarTexto: {
    color: Tema.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  perfilInfo: {
    flex: 1,
    marginLeft: Espaciado.md,
  },
  perfilNombre: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  perfilCorreo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
  },
  badgeAdmin: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 160, 96, 0.2)', // Dorado semi-transparente
    paddingHorizontal: Espaciado.sm,
    paddingVertical: 2,
    borderRadius: RadioBorde.sm,
    marginTop: Espaciado.xs,
    borderWidth: 1,
    borderColor: 'rgba(201, 160, 96, 0.5)',
  },
  badgeAdminTexto: {
    color: '#c9a060',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  seccion: {
    marginBottom: Espaciado.xl,
  },
  seccionTitulo: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Espaciado.md,
    letterSpacing: 1,
  },
  tarjeta: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    overflow: 'hidden',
  },
  opcionMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.md,
  },
  iconoContenedor: {
    width: 40,
    height: 40,
    borderRadius: RadioBorde.md,
    backgroundColor: Tema.dark.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  textoContenedor: {
    flex: 1,
    marginLeft: Espaciado.md,
  },
  opcionTitulo: {
    color: Tema.dark.text,
    fontSize: 15,
    fontWeight: '500',
  },
  opcionSubtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: Tema.dark.border,
    marginLeft: 40 + Espaciado.md * 2, // Alinear con el texto
  },
  botonSalir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tema.dark.surface,
    padding: Espaciado.md,
    borderRadius: RadioBorde.lg,
    borderWidth: 1,
    borderColor: Tema.dark.borderRed,
    gap: Espaciado.sm,
  },
  botonSalirTexto: {
    color: Tema.dark.error,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  // Estilos No Autenticado
  noAuthContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Espaciado.xl,
  },
  noAuthTitulo: {
    color: Tema.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: Espaciado.lg,
    marginBottom: Espaciado.sm,
  },
  noAuthSubtitulo: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Espaciado.xl,
    lineHeight: 20,
  },
  botonPrimario: {
    backgroundColor: Tema.dark.tint,
    width: '100%',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    marginBottom: Espaciado.md,
  },
  botonPrimarioTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    width: '100%',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Tema.dark.tint,
  },
  botonSecundarioTexto: {
    color: Tema.dark.tint,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
