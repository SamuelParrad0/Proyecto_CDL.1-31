import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import servicioPaquetes from '@/src/servicios/servicioPaquetes';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PaquetesListScreen() {
  const router = useRouter();
  const [paquetes, setPaquetes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [paqueteFiltro, setPaqueteFiltro] = useState('todos');

  useEffect(() => {
    cargarPaquetes();
  }, []);

  const cargarPaquetes = async () => {
    try {
      const data = await servicioPaquetes.listarPaquetes();
      setPaquetes(data);
    } catch (error) {
      console.warn('Error de red:', error?.message || error);
    } finally {
      setCargando(false);
    }
  };

  const renderPaquete = ({ item }) => {
    const precio = Number(item.Precio_Paquete).toLocaleString('es-CO');
    
    return (
      <TouchableOpacity 
        style={styles.tarjeta}
        activeOpacity={0.8}
        onPress={() => router.push(`/paquetes/${item.Id_Paquete}`)}
      >
        <ImageBackground 
          source={{ uri: item.Imagen_Paquete || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' }} 
          style={styles.imagenFondo}
          imageStyle={styles.imagenBorde}
        >
          <View style={styles.overlay}>
            <View style={styles.headerTarjeta}>
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>Premium</Text>
              </View>
              <Text style={styles.precio}>${precio}</Text>
            </View>
            
            <View style={styles.infoContenedor}>
              <Text style={styles.titulo}>{item.Nombre_Paquete}</Text>
              <Text style={styles.descripcion} numberOfLines={2}>
                {item.Descripcion_Paquete}
              </Text>
              
              <View style={styles.footerTarjeta}>
                <Text style={styles.verMasTexto}>Ver detalles</Text>
                <IconSymbol name="arrow.right" size={16} color={Tema.dark.tint} />
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {cargando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={paquetes.filter(p => {
            const coincideTexto = (p.Nombre_Paquete || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                                  (p.Descripcion_Paquete || '').toLowerCase().includes(busqueda.toLowerCase());
            const coincideSelect = paqueteFiltro === 'todos' || p.Nombre_Paquete === paqueteFiltro;
            return coincideTexto && coincideSelect;
          })}
          renderItem={renderPaquete}
          keyExtractor={(item) => item.Id_Paquete.toString()}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitulo}>Paquetes <Text style={styles.textoRojo}>Fotográficos</Text></Text>
              <Text style={styles.headerSubtitulo}>Elige el plan perfecto para tu evento y conserva tus recuerdos para siempre.</Text>
              
              <View style={styles.filtrosContenedor}>
                <TextInput 
                  style={styles.inputBusqueda}
                  placeholder="Buscar paquete..."
                  placeholderTextColor={Tema.dark.textSecondary}
                  value={busqueda}
                  onChangeText={setBusqueda}
                />
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={paqueteFiltro}
                    onValueChange={(itemValue) => setPaqueteFiltro(itemValue)}
                    style={{ color: '#fff', height: 50 }}
                    dropdownIconColor={Tema.dark.tint}
                  >
                    <Picker.Item label="Todos los paquetes" value="todos" />
                    {paquetes.filter(p => p.Activo == 1 || p.Activo === true || p.Activo === '1').map(p => (
                      <Picker.Item key={p.Id_Paquete.toString()} label={p.Nombre_Paquete} value={p.Nombre_Paquete} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          }
        />
      )}
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
  },
  lista: {
    padding: Espaciado.lg,
    paddingBottom: Espaciado.xxl,
  },
  header: {
    marginBottom: Espaciado.xl,
  },
  headerTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  textoRojo: {
    color: Tema.dark.tint,
  },
  headerSubtitulo: {
    color: Tema.dark.textSecondary,
    fontSize: 14,
    marginTop: Espaciado.sm,
    lineHeight: 20,
  },
  filtrosContenedor: {
    marginTop: Espaciado.md,
  },
  inputBusqueda: {
    backgroundColor: Tema.dark.surface,
    color: '#fff',
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    paddingHorizontal: Espaciado.md,
    height: 45,
    marginBottom: Espaciado.sm,
  },
  pickerContainer: {
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tarjeta: {
    height: 250,
    marginBottom: Espaciado.lg,
    borderRadius: RadioBorde.lg,
    shadowColor: Tema.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  imagenFondo: {
    flex: 1,
  },
  imagenBorde: {
    borderRadius: RadioBorde.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 3, 8, 0.65)',
    borderRadius: RadioBorde.lg,
    padding: Espaciado.md,
    justifyContent: 'space-between',
  },
  headerTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 8, 68, 0.2)',
    paddingHorizontal: Espaciado.sm,
    paddingVertical: 4,
    borderRadius: RadioBorde.sm,
    borderWidth: 1,
    borderColor: Tema.dark.tint,
  },
  badgeTexto: {
    color: Tema.dark.tint,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  precio: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContenedor: {
    backgroundColor: 'rgba(22, 22, 37, 0.85)',
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.borderRed,
  },
  titulo: {
    color: Tema.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descripcion: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    marginBottom: Espaciado.sm,
  },
  footerTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verMasTexto: {
    color: Tema.dark.tint,
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
