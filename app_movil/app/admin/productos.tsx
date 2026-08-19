import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image, Switch, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { listarProductosAdmin, toggleProducto, crearProducto, editarProducto } from '@/src/servicios/servicioAdmin';
import servicioCatalogo from '@/src/servicios/servicioCatalogo';
import { IconSymbol } from '@/components/ui/IconSymbol';

const obtenerColorStock = (stock: number) => {
  if (stock <= 0) return '#ff0844';
  if (stock <= 5) return '#f59e0b';
  return Tema.dark.textSecondary;
};

const obtenerTextoStock = (stock: number) => {
  if (stock <= 0) return 'AGOTADO';
  if (stock <= 5) return `Stock Bajo: ${stock}`;
  return `Stock: ${stock || 0}`;
};

export default function AdminProductosScreen() {
  const router = useRouter();
  const { esAdmin, esAuxiliar } = useContext(AuthContext);

  const [productos, setProductos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    nombre: '', precio: '', descripcion: '', imagen: '', categoriaId: '', stock: '' 
  });

  const cargarProductos = async () => {
    try {
      const data = await listarProductosAdmin();
      setProductos(data);
    } catch (error: any) {
      console.warn('Error de red:', error?.message || error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    }
  };

  const cargarCategorias = async () => {
    try {
      const cats = await servicioCatalogo.obtenerCategorias();
      setCategorias(cats);
    } catch (error: any) {
      console.warn('Error cargando categorías:', error?.message || error);
    }
  };

  const cargarDatosInit = async () => {
    try {
      setCargando(true);
      await Promise.all([cargarProductos(), cargarCategorias()]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!esAdmin && !esAuxiliar) {
      router.replace('/(tabs)');
      return;
    }
    cargarDatosInit();
  }, [esAdmin, esAuxiliar]);

  const onRefresh = async () => {
    setRefrescando(true);
    await Promise.all([cargarProductos(), cargarCategorias()]);
    setRefrescando(false);
  };

  const abrirModal = (producto: any = null) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombre: producto.Nombre_Producto || '',
        precio: producto.Precio_Producto?.toString() || '',
        descripcion: producto.Descripcion_Producto || '',
        imagen: producto.Imagen_Producto || '',
        categoriaId: producto.Id_Categoria?.toString() || '',
        stock: producto.Stock?.toString() || '0'
      });
    } else {
      setProductoEditando(null);
      setFormData({ nombre: '', precio: '', descripcion: '', imagen: '', categoriaId: '', stock: '0' });
    }
    setModalVisible(true);
  };

  const guardarProducto = async () => {
    if (!formData.nombre || !formData.precio || !formData.descripcion || !formData.categoriaId) {
      Alert.alert('Atención', 'Por favor completa los campos requeridos (Nombre, Precio, Descripción, Categoría)');
      return;
    }

    try {
      setGuardando(true);
      
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        imagen: formData.imagen,
        categoriaId: Number(formData.categoriaId),
        stock: Number(formData.stock),
        Activo: true
      };

      if (productoEditando) {
        await editarProducto(productoEditando.Id_Producto, payload);
        Alert.alert('Éxito', 'Producto editado correctamente');
      } else {
        await crearProducto(payload);
        Alert.alert('Éxito', 'Producto creado correctamente');
      }

      setModalVisible(false);
      await cargarProductos();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const manejarToggle = async (id: number, estadoActual: any) => {
    try {
      setProductos(current => 
        current.map(p => p.Id_Producto === id ? { ...p, Activo: !estadoActual } : p)
      );
      await toggleProducto(id);
    } catch {
      setProductos(current => 
        current.map(p => p.Id_Producto === id ? { ...p, Activo: estadoActual } : p)
      );
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  const renderProducto = ({ item }: { item: any }) => {
    const imagenUrl = servicioCatalogo.construirUrlImagen(item.Imagen_Producto);
    const activo = item.Activo === 1 || item.Activo === true;
    const stockNum = Number(item.Stock || 0);

    return (
      <View style={[styles.tarjeta, !activo && styles.tarjetaInactiva]}>
        <Image source={{ uri: imagenUrl }} style={styles.imagen} />
        
        <View style={styles.info}>
          <Text style={styles.nombre} numberOfLines={2}>{item.Nombre_Producto}</Text>
          <Text style={styles.precio}>${Number(item.Precio_Producto).toLocaleString('es-CO')}</Text>
          <Text style={[styles.stock, { color: obtenerColorStock(stockNum), fontWeight: stockNum <= 5 ? 'bold' : 'normal' }]}>
            {obtenerTextoStock(stockNum)}
          </Text>
        </View>

        <View style={styles.acciones}>
          <View style={{ alignItems: 'center', marginRight: 4 }}>
            <Switch
              value={activo}
              onValueChange={() => manejarToggle(item.Id_Producto, item.Activo)}
              trackColor={{ false: Tema.dark.border, true: Tema.dark.tint }}
              thumbColor={activo ? '#fff' : '#f4f3f4'}
            />
            <Text style={{ fontSize: 9, color: activo ? Tema.dark.exito || '#22c55e' : Tema.dark.textSecondary, fontWeight: 'bold', marginTop: 2 }}>
              {activo ? 'ACTIVO' : 'INACTIVO'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.botonAccion}
            onPress={() => abrirModal(item)}
          >
            <IconSymbol name="pencil" size={20} color={Tema.dark.dorado || '#c9a060'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const productosFiltrados = productos.filter(p => 
    p.Nombre_Producto?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>Productos</Text></Text>
          <Text style={styles.subtitulo}>{productos.length} productos en total</Text>
        </View>
        <TouchableOpacity 
          style={styles.botonAgregarHeader}
          onPress={() => abrirModal()}
        >
          <IconSymbol name="plus" size={24} color={Tema.dark.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={Tema.dark.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto por nombre..."
          placeholderTextColor={Tema.dark.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={Tema.dark.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}>
          <ActivityIndicator size="large" color={Tema.dark.tint} />
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          renderItem={renderProducto}
          keyExtractor={(item) => item.Id_Producto.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: Espaciado.xl }}>
              <Text style={{ color: Tema.dark.textSecondary }}>
                {searchQuery ? 'No se encontraron productos coincidentes.' : 'No hay productos registrados.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal Formulario */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color={Tema.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(text) => setFormData({...formData, nombre: text})}
              placeholder="Ej. Taza Mágica"
              placeholderTextColor={Tema.dark.textSecondary}
            />

            <View style={{flexDirection: 'row', gap: 10}}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Precio *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.precio}
                  onChangeText={(text) => setFormData({...formData, precio: text})}
                  placeholder="0"
                  placeholderTextColor={Tema.dark.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(text) => setFormData({...formData, stock: text})}
                  placeholder="0"
                  placeholderTextColor={Tema.dark.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>URL Imagen</Text>
            <TextInput
              style={styles.input}
              value={formData.imagen}
              onChangeText={(text) => setFormData({...formData, imagen: text})}
              placeholder="https://..."
              placeholderTextColor={Tema.dark.textSecondary}
            />

            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.categorySelectorRow}>
               {categorias.map(c => (
                 <TouchableOpacity 
                   key={c.Id_Categoria} 
                   style={[styles.categoryOption, formData.categoriaId === c.Id_Categoria.toString() && styles.categoryOptionSelected]}
                   onPress={() => setFormData({...formData, categoriaId: c.Id_Categoria.toString()})}
                 >
                    <Text style={[styles.categoryOptionText, formData.categoriaId === c.Id_Categoria.toString() && styles.categoryOptionTextSelected]}>
                      {c.Nombre_Categoria}
                    </Text>
                 </TouchableOpacity>
               ))}
            </View>

            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(text) => setFormData({...formData, descripcion: text})}
              placeholder="Detalles del producto..."
              placeholderTextColor={Tema.dark.textSecondary}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity 
              style={[styles.botonGuardar, guardando && { opacity: 0.7 }]} 
              onPress={guardarProducto}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonGuardarTexto}>GUARDAR PRODUCTO</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  headerTextContainer: {
    flex: 1,
  },
  botonVolver: {
    padding: Espaciado.sm,
    marginRight: Espaciado.sm,
    marginLeft: -Espaciado.sm,
  },
  botonAgregarHeader: {
    padding: Espaciado.sm,
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
  },
  cargandoContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface,
    marginHorizontal: Espaciado.lg,
    marginTop: Espaciado.md,
    paddingHorizontal: Espaciado.md,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: Tema.dark.text,
    marginLeft: Espaciado.sm,
    fontSize: 14,
  },
  lista: {
    padding: Espaciado.lg,
    paddingTop: Espaciado.md,
    gap: Espaciado.md,
  },
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: Tema.dark.surface,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    padding: Espaciado.sm,
    alignItems: 'center',
  },
  tarjetaInactiva: {
    opacity: 0.6,
  },
  imagen: {
    width: 60,
    height: 60,
    borderRadius: RadioBorde.sm,
    backgroundColor: Tema.dark.surface2,
  },
  info: {
    flex: 1,
    marginLeft: Espaciado.md,
    justifyContent: 'center',
  },
  nombre: {
    color: Tema.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  precio: {
    color: Tema.dark.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  stock: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Espaciado.sm,
  },
  botonAccion: {
    padding: Espaciado.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Tema.dark.surface,
    borderTopLeftRadius: RadioBorde.lg,
    borderTopRightRadius: RadioBorde.lg,
    padding: Espaciado.lg,
    paddingBottom: Espaciado.xl * 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Espaciado.lg,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Tema.dark.text,
  },
  label: {
    color: Tema.dark.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Tema.dark.surface2,
    color: Tema.dark.text,
    borderRadius: RadioBorde.md,
    padding: Espaciado.md,
    marginBottom: Espaciado.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Espaciado.md,
  },
  categoryOption: {
    paddingHorizontal: Espaciado.md,
    paddingVertical: 8,
    borderRadius: RadioBorde.sm,
    backgroundColor: Tema.dark.surface2,
    borderWidth: 1,
    borderColor: Tema.dark.border,
  },
  categoryOptionSelected: {
    backgroundColor: Tema.dark.tint + '20',
    borderColor: Tema.dark.tint,
  },
  categoryOptionText: {
    color: Tema.dark.textSecondary,
    fontSize: 13,
  },
  categoryOptionTextSelected: {
    color: Tema.dark.tint,
    fontWeight: 'bold',
  },
  botonGuardar: {
    backgroundColor: Tema.dark.tint,
    padding: Espaciado.md,
    borderRadius: RadioBorde.md,
    alignItems: 'center',
    marginTop: Espaciado.md,
  },
  botonGuardarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});