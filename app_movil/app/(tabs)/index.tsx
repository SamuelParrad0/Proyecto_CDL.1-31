import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import servicioCatalogo from '@/src/servicios/servicioCatalogo';
import { CarritoContext } from '@/src/contexto/ContextoCarrito';
import { Picker } from '@react-native-picker/picker';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';

const MAPA_IMAGENES_PRODUCTO: Record<string, any> = {
  'cajita corazón': require('../../assets/images/productos/Cajita-corazon.png'),
  'bolsa sorpresa': require('../../assets/images/productos/Bolsa-Sorpresa.png'),
  'caja multifotográfica': require('../../assets/images/productos/Caja-multifotografia.png'),
  'libro emoción': require('../../assets/images/productos/Libro-emocion.png'),
  'productos amor': require('../../assets/images/productos/Productos-amor.png'),
};

const obtenerImagenProducto = (producto: any) => {
  if (producto.imagenUrl && !producto.imagenUrl.includes('/null')) return { uri: producto.imagenUrl };
  if (producto.Imagen_Producto?.startsWith('http')) return { uri: producto.Imagen_Producto };
  if (producto.imagen?.startsWith('http')) return { uri: producto.imagen };

  const nombreLower = (producto.Nombre_Producto || '').toLowerCase();
  for (const [clave, req] of Object.entries(MAPA_IMAGENES_PRODUCTO)) {
    if (nombreLower.includes(clave)) return req;
  }
  return { uri: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&q=80' };
};

const obtenerColorStock = (stock: number) => {
  if (stock <= 0) return '#ff0844';
  if (stock <= 5) return '#f59e0b';
  return '#22c55e';
};

const obtenerTextoStock = (stock: number) => {
  if (stock <= 0) return 'Agotado';
  if (stock <= 5) return `¡Últimas ${stock} uds!`;
  return `${stock} disponibles`;
};

export default function TiendaScreen() {
  const router = useRouter();
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const { agregarAlCarrito, items } = useContext(CarritoContext);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [cats, prods] = await Promise.all([
        servicioCatalogo.obtenerCategorias(),
        servicioCatalogo.obtenerProductos()
      ]);
      setCategorias([{ Id_Categoria: null, Nombre_Categoria: 'Todos' }, ...cats]);
      setProductos(prods);
    } catch (error: any) {
      console.warn('Error al cargar productos:', error?.message || error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarDatos();
    setCategoriaActiva(null);
    setRefrescando(false);
  };

  const filtrarPorCategoria = async (idCat: any) => {
    setCategoriaActiva(idCat);
    try {
      setCargando(true);
      const prods = await servicioCatalogo.obtenerProductos(idCat);
      setProductos(prods);
    } catch (error: any) {
      console.warn('Error al filtrar productos:', error?.message || error);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarAlCarrito = (producto: any) => {
    const itemEnCarrito = (items || []).find((i: any) => i.id === producto.Id_Producto || i.Id_Producto === producto.Id_Producto);
    const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;
    
    if (cantidadActual + 1 > (producto.Stock || 0)) {
      Alert.alert('Agotado', 'No hay suficientes unidades disponibles en stock.');
      return;
    }

    agregarAlCarrito(producto, 1);
    Alert.alert('Agregado', `${producto.Nombre_Producto} se añadió a tu carrito.`, [
      { text: 'Seguir comprando', style: 'cancel' },
      { text: 'Ir al carrito', onPress: () => router.push('/carrito') }
    ]);
  };

  const renderProducto = ({ item }: { item: any }) => {
    const imageSource = obtenerImagenProducto(item);
    const precio = Number(item.Precio_Producto).toLocaleString('es-CO');
    const stock = item.Stock || 0;

    return (
      <View style={styles.productoCard}>
        <Image source={imageSource} style={styles.productoImagen} resizeMode="cover" />
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre} numberOfLines={2}>{item.Nombre_Producto}</Text>
          <Text style={styles.productoPrecio}>${precio}</Text>
          <Text style={[styles.stockTexto, { color: obtenerColorStock(stock) }]}>
            {obtenerTextoStock(stock)}
          </Text>
          
          <TouchableOpacity 
            style={[styles.botonAgregar, stock <= 0 && { backgroundColor: '#ff0844', opacity: 0.8 }]}
            onPress={() => handleAgregarAlCarrito(item)}
            disabled={stock <= 0}
          >
            <IconSymbol name={stock <= 0 ? "xmark.circle" : "cart.badge.plus"} size={18} color="#fff" />
            <Text style={styles.botonAgregarTexto}>
              {stock <= 0 ? 'AGOTADO' : 'AGREGAR'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Nuestros <Text style={styles.tituloDestacado}>Productos</Text></Text>
        <Text style={styles.subtitulo}>Encuentra el detalle perfecto</Text>
      </View>

      <View style={{ paddingHorizontal: Espaciado.lg, marginBottom: Espaciado.md }}>
        <TextInput 
          style={styles.inputBusqueda}
          placeholder="Buscar producto..."
          placeholderTextColor={Tema.dark.textSecondary}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoriaActiva}
            onValueChange={(itemValue) => filtrarPorCategoria(itemValue)}
            style={{ color: '#fff', height: 50 }}
            dropdownIconColor={Tema.dark.tint}
          >
            {categorias.filter(cat => cat.Id_Categoria === null || (cat.Activo == 1 || cat.Activo === true || cat.Activo === '1')).map(cat => (
              <Picker.Item key={cat.Id_Categoria || 'todos'} label={cat.Nombre_Categoria} value={cat.Id_Categoria} />
            ))}
          </Picker>
        </View>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={productos.filter(p => p.Nombre_Producto.toLowerCase().includes(busqueda.toLowerCase()))}
          renderItem={renderProducto}
          keyExtractor={(item) => item.Id_Producto.toString()}
          numColumns={2}
          contentContainerStyle={styles.productosLista}
          columnWrapperStyle={styles.productosFila}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <Text style={styles.vacioTexto}>No hay productos en esta categoría</Text>
            </View>
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
    paddingBottom: Espaciado.md,
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
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productosLista: {
    padding: Espaciado.lg,
    paddingTop: 0,
    paddingBottom: Espaciado.xxl,
  },
  productosFila: {
    justifyContent: 'space-between',
    marginBottom: Espaciado.lg,
  },
  productoCard: {
    width: '48%',
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  productoImagen: {
    width: '100%',
    height: 150,
    backgroundColor: Tema.dark.surface2,
  },
  productoInfo: {
    padding: Espaciado.md,
  },
  productoNombre: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Espaciado.xs,
    height: 40,
  },
  productoPrecio: {
    color: Tema.dark.tint,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Espaciado.xs,
  },
  stockTexto: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: Espaciado.sm,
  },
  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tema.dark.surface2,
    paddingVertical: Espaciado.sm,
    borderRadius: RadioBorde.md,
    gap: Espaciado.xs,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  vacioContenedor: {
    padding: Espaciado.xl,
    alignItems: 'center',
  },
  vacioTexto: {
    color: Tema.dark.textSecondary,
    textAlign: 'center',
  },
});