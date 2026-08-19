import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import servicioDirecciones from '@/src/servicios/servicioDirecciones';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function MisDireccionesScreen() {
  const router = useRouter();
  const [direcciones, setDirecciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarDirecciones = async () => {
    try {
      const data = await servicioDirecciones.obtenerMisDirecciones();
      setDirecciones(data);
    } catch (error: any) {
      console.warn('Error de red:', error?.message || error);
      Alert.alert('Error', 'No se pudieron cargar tus direcciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDirecciones();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarDirecciones();
    setRefrescando(false);
  };

  const confirmarEliminacion = (id: any) => {
    Alert.alert(
      'Eliminar Dirección',
      '¿Estás seguro de que deseas eliminar esta dirección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCargando(true);
              await servicioDirecciones.eliminarDireccion(id);
              await cargarDirecciones();
              Alert.alert('Éxito', 'La dirección ha sido eliminada');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar la dirección');
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  const renderDireccion = ({ item }: { item: any }) => {
    const isResidencia = item.Residencia_Laboral === 'Residencia';
    const icono = isResidencia ? 'house.fill' : 'building.2.fill';

    return (
      <View style={styles.tarjeta}>
        <View style={styles.tarjetaHeader}>
          <View style={styles.tipoContenedor}>
            <IconSymbol name={icono} size={16} color={Tema.dark.tint} />
            <Text style={styles.tipoTexto}>{item.Residencia_Laboral}</Text>
          </View>
        </View>

        <View style={styles.tarjetaBody}>
          <Text style={styles.nombreCompleto}>{item.Nombre_Completo}</Text>
          <Text style={styles.direccionPrincipal}>{item.Direccion_Completa}</Text>
          <Text style={styles.ubicacion}>{item.Barrio}, {item.Municipio_Localidad} - {item.Departamento}</Text>
          
          {Boolean(item.Apartamento_Casa) && (
            <Text style={styles.textoSecundario}>Apto/Casa: {item.Apartamento_Casa}</Text>
          )}
          
          <Text style={styles.textoSecundario}>Tel: {item.Telefono_Contacto}</Text>
          
          {Boolean(item.Indicaciones_Adicionales) && (
            <View style={styles.indicacionesContenedor}>
              <Text style={styles.indicacionesTitulo}>Indicaciones:</Text>
              <Text style={styles.indicacionesTexto}>{item.Indicaciones_Adicionales}</Text>
            </View>
          )}
        </View>

        <View style={styles.tarjetaFooter}>
          <TouchableOpacity 
            style={styles.botonAccion}
            onPress={() => router.push({
              pathname: '/direcciones/nueva',
              params: { editarId: item.Id_Direccion }
            })}
          >
            <IconSymbol name="pencil" size={16} color={Tema.dark.textSecondary} />
            <Text style={styles.botonTextoSecundario}>EDITAR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.botonAccion}
            onPress={() => confirmarEliminacion(item.Id_Direccion)}
          >
            <IconSymbol name="trash" size={16} color={Tema.dark.error} />
            <Text style={styles.botonTextoError}>ELIMINAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Mis <Text style={styles.textoRojo}>Direcciones</Text></Text>
          <Text style={styles.subtitulo}>Gestiona tus direcciones de envío.</Text>
        </View>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : direcciones.length === 0 ? (
        <View style={styles.vacioContenedor}>
          <IconSymbol name="map.fill" size={80} color={Tema.dark.borderRed} />
          <Text style={styles.vacioTitulo}>No tienes direcciones</Text>
          <Text style={styles.vacioSubtitulo}>Agrega una dirección para recibir tus pedidos físicos.</Text>
        </View>
      ) : (
        <FlatList
          data={direcciones}
          renderItem={renderDireccion}
          keyExtractor={(item) => String(item.Id_Direccion)}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.botonNuevo}
          onPress={() => router.push('/direcciones/nueva')}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
          <Text style={styles.botonNuevoTexto}>AGREGAR DIRECCIÓN</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Espaciado.lg,
  },
  botonVolver: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
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
    padding: Espaciado.md,
    backgroundColor: Tema.dark.surface2,
    borderBottomWidth: 1,
    borderBottomColor: Tema.dark.border,
  },
  tipoContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.xs,
    backgroundColor: 'rgba(255, 8, 68, 0.1)',
    paddingHorizontal: Espaciado.sm,
    paddingVertical: 4,
    borderRadius: RadioBorde.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 8, 68, 0.3)',
  },
  tipoTexto: {
    color: Tema.dark.tint,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tarjetaBody: {
    padding: Espaciado.md,
  },
  nombreCompleto: {
    color: Tema.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Espaciado.sm,
  },
  direccionPrincipal: {
    color: Tema.dark.text,
    fontSize: 15,
    marginBottom: 4,
  },
  ubicacion: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginBottom: Espaciado.sm,
  },
  textoSecundario: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  indicacionesContenedor: {
    marginTop: Espaciado.sm,
    padding: Espaciado.sm,
    backgroundColor: Tema.dark.surface2,
    borderRadius: RadioBorde.sm,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  indicacionesTitulo: {
    color: Tema.dark.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  indicacionesTexto: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  tarjetaFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Tema.dark.border,
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Espaciado.md,
    gap: Espaciado.xs,
  },
  botonTextoSecundario: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  botonTextoError: {
    color: Tema.dark.error,
    fontSize: 13,
    fontWeight: '600',
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