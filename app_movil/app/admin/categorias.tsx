import { useState, useEffect, useContext } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View, Modal, TouchableOpacity, Switch } from 'react-native';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { crearCategoria, listarCategoriasAdmin, editarCategoria, toggleCategoria } from '@/src/servicios/servicioAdmin';
import { ThemedText } from '../../components/themed-text';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

type Categoria = {
  Id_Categoria?: number;
  Nombre_Categoria?: string;
  Descripcion_Categoria?: string;
  Activo?: boolean;
};

export default function AdminCategoriasScreen() {
  const router = useRouter();
  const { esAdmin, esAuxiliar, estaAutenticado } = useContext(AuthContext) as any;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State para Editar
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');

  const fetchCategorias = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await listarCategoriasAdmin();
      setCategorias(res || []);
    } catch (error: unknown) {
      const err = error as any;
      setErrorMessage(err?.response?.data?.message || err?.message || 'Error al cargar categorías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (estaAutenticado && (esAdmin || esAuxiliar)) {
      fetchCategorias();
    }
  }, [estaAutenticado, esAdmin, esAuxiliar]);

  const handleCrearCategoria = async () => {
    if (!nombre.trim()) {
      setErrorMessage('El nombre de la categoría es requerido.');
      setSuccessMessage('');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await crearCategoria({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined });
      setNombre('');
      setDescripcion('');
      setSuccessMessage('Categoría creada con éxito.');
      fetchCategorias();
    } catch (error: unknown) {
      const err = error as any;
      setErrorMessage(err?.response?.data?.message || err?.message || 'No se pudo crear la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const abrirModalEditar = (cat: Categoria) => {
    setCategoriaEditando(cat);
    setEditNombre(cat.Nombre_Categoria || '');
    setEditDescripcion(cat.Descripcion_Categoria || '');
    setModalVisible(true);
  };

  const handleEditarCategoria = async () => {
    if (!editNombre.trim() || !categoriaEditando?.Id_Categoria) {
      Alert.alert('Error', 'El nombre es requerido.');
      return;
    }
    setSaving(true);
    try {
      await editarCategoria(categoriaEditando.Id_Categoria, { 
        nombre: editNombre.trim(), 
        descripcion: editDescripcion.trim() || undefined 
      });
      setModalVisible(false);
      Alert.alert('Éxito', 'Categoría editada con éxito.');
      fetchCategorias();
    } catch (error: unknown) {
      Alert.alert('Error', 'No se pudo editar la categoría.');
    } finally {
      setSaving(false);
    }
  };


  const manejarToggle = async (id: number, estadoActual: boolean) => {
    try {
      setCategorias(current => 
        current.map(c => c.Id_Categoria === id ? { ...c, Activo: !estadoActual } : c)
      );
      await toggleCategoria(id);
    } catch (error) {
      setCategorias(current => 
        current.map(c => c.Id_Categoria === id ? { ...c, Activo: estadoActual } : c)
      );
      Alert.alert('Error', 'No se pudo cambiar el estado de la categoría.');
    }
  };

  if (!estaAutenticado || (!esAdmin && !esAuxiliar)) {
    return (
      <View style={styles.restrictedContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={60} color={Tema.dark.error} />
        <Text style={styles.restrictedTitle}>Acceso denegado</Text>
        <Text style={styles.restrictedSubtitle}>No tienes permisos para gestionar categorías.</Text>
      </View>
    );
  }

  const categoriasFiltradas = categorias.filter(c => 
    c.Nombre_Categoria?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.containerWrapper} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>Categorías</Text></Text>
          <Text style={styles.subtitulo}>{categorias.length} categorías registradas</Text>
        </View>
      </View>

      <FlatList
        data={categoriasFiltradas}
        keyExtractor={(item) => String(item.Id_Categoria)}
        style={styles.container}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.section}>
              <ThemedText type="subtitle">Crear nueva categoría</ThemedText>

              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre de la categoría"
                placeholderTextColor={Tema.dark.textSecondary}
                style={styles.input}
              />
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción (opcional)"
                placeholderTextColor={Tema.dark.textSecondary}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
              />

              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
              {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

              <Pressable style={styles.saveBtn} onPress={handleCrearCategoria} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'GUARDANDO...' : 'GUARDAR CATEGORÍA'}</Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Categorías existentes</ThemedText>
            </View>
            <View style={styles.searchContainer}>
              <IconSymbol name="magnifyingglass" size={20} color={Tema.dark.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar categoría por nombre..."
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
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.categoryName}>{item.Nombre_Categoria}</Text>
              <Text style={styles.categoryDescription}>{item.Descripcion_Categoria || 'Sin descripción'}</Text>
            </View>
            <View style={styles.cardActions}>
              <View style={{ alignItems: 'center', marginRight: 4 }}>
                <Switch
                  value={Boolean(item.Activo)}
                  onValueChange={() => manejarToggle(item.Id_Categoria!, Boolean(item.Activo))}
                  trackColor={{ false: Tema.dark.border, true: Tema.dark.tint }}
                  thumbColor={item.Activo ? '#fff' : '#f4f3f4'}
                />
                <Text style={{ fontSize: 9, color: item.Activo ? Tema.dark.exito || '#22c55e' : Tema.dark.textSecondary, fontWeight: 'bold', marginTop: 2 }}>
                  {item.Activo ? 'ACTIVO' : 'INACTIVO'}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => abrirModalEditar(item)}
              >
                <IconSymbol name="pencil" size={16} color={Tema.dark.text} />
                <Text style={styles.actionBtnText}>Editar</Text>
              </TouchableOpacity>
              

            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron categorías coincidentes.' : 'No hay categorías todavía.'}
            </Text>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="large" color={Tema.dark.tint} />
            </View>
          ) : null
        }
      />
      
      {/* Modal Editar Categoría */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Editar Categoría</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.botonCerrarModal}>
                <IconSymbol name="xmark" size={20} color={Tema.dark.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.modalInput}
              value={editNombre}
              onChangeText={setEditNombre}
              placeholder="Nombre de la categoría"
              placeholderTextColor={Tema.dark.textSecondary}
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              value={editDescripcion}
              onChangeText={setEditDescripcion}
              placeholder="Descripción (opcional)"
              placeholderTextColor={Tema.dark.textSecondary}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity 
              style={[styles.botonGuardar, saving && { opacity: 0.7 }]} 
              onPress={handleEditarCategoria}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonGuardarTexto}>GUARDAR CAMBIOS</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
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
  botonVolver: {
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
  },
  container: { 
    flex: 1, 
  },
  content: { 
    gap: Espaciado.md, 
    padding: Espaciado.lg,
    paddingBottom: Espaciado.xl * 2 
  },
  section: { 
    backgroundColor: Tema.dark.surface, 
    borderRadius: RadioBorde.lg, 
    padding: Espaciado.lg, 
    gap: Espaciado.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    marginBottom: Espaciado.md
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: Espaciado.sm
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Tema.dark.surface,
    paddingHorizontal: Espaciado.md,
    borderRadius: RadioBorde.md,
    borderWidth: 1,
    borderColor: Tema.dark.border,
    height: 44,
    marginBottom: Espaciado.md,
  },
  searchInput: {
    flex: 1,
    color: Tema.dark.text,
    marginLeft: Espaciado.sm,
    fontSize: 14,
  },
  input: { 
    borderWidth: 1, 
    borderColor: Tema.dark.border, 
    borderRadius: RadioBorde.md, 
    padding: Espaciado.md, 
    backgroundColor: Tema.dark.surface2,
    color: Tema.dark.text,
    fontSize: 16
  },
  textArea: { 
    minHeight: 100, 
    textAlignVertical: 'top' 
  },
  saveBtn: { 
    backgroundColor: Tema.dark.tint, 
    borderRadius: RadioBorde.md, 
    paddingVertical: 14, 
    alignItems: 'center',
    marginTop: Espaciado.sm
  },
  saveBtnText: { 
    color: '#fff', 
    fontWeight: 'bold',
    letterSpacing: 1
  },
  error: { color: Tema.dark.error },
  success: { color: Tema.dark.exito || '#22c55e' },
  loadingRow: { alignItems: 'center', marginVertical: Espaciado.xl },
  categoryCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    gap: Espaciado.md, 
    backgroundColor: Tema.dark.surface, 
    borderRadius: RadioBorde.lg, 
    padding: Espaciado.md, 
    borderWidth: 1, 
    borderColor: Tema.dark.border, 
    marginBottom: Espaciado.sm 
  },
  categoryName: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: Tema.dark.text
  },
  categoryDescription: { 
    color: Tema.dark.textSecondary, 
    marginTop: 4,
    fontSize: 13
  },
  cardActions: { 
    alignItems: 'flex-end', 
    gap: Espaciado.sm 
  },
  actionBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Tema.dark.surface2, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: RadioBorde.sm, 
    borderWidth: 1, 
    borderColor: Tema.dark.border 
  },
  actionBtnText: { 
    color: Tema.dark.text, 
    fontWeight: '600', 
    fontSize: 12 
  },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: Tema.dark.surface, 
    borderTopLeftRadius: RadioBorde.lg, 
    borderTopRightRadius: RadioBorde.lg, 
    padding: Espaciado.lg, 
    paddingBottom: Espaciado.xl * 2,
    borderTopWidth: 1,
    borderColor: Tema.dark.border
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: Espaciado.lg 
  },
  modalTitulo: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: Tema.dark.text 
  },
  botonCerrarModal: {
    padding: Espaciado.xs,
  },
  label: { 
    color: Tema.dark.textSecondary, 
    fontSize: 12, 
    marginBottom: 6, 
    fontWeight: 'bold', 
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  modalInput: { 
    backgroundColor: Tema.dark.surface2, 
    color: Tema.dark.text, 
    borderRadius: RadioBorde.md, 
    padding: Espaciado.md, 
    marginBottom: Espaciado.md, 
    borderWidth: 1, 
    borderColor: Tema.dark.border,
    fontSize: 16
  },
  botonGuardar: { 
    backgroundColor: Tema.dark.tint, 
    padding: Espaciado.md, 
    borderRadius: RadioBorde.md, 
    alignItems: 'center', 
    marginTop: Espaciado.md 
  },
  botonGuardarTexto: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16, 
    letterSpacing: 1 
  },
  emptyText: { 
    color: Tema.dark.textSecondary, 
    textAlign: 'center', 
    marginTop: Espaciado.xl 
  },
  restrictedContainer: { 
    flex: 1, 
    backgroundColor: Tema.dark.background,
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: Espaciado.xl 
  },
  restrictedTitle: { 
    color: Tema.dark.text,
    fontSize: 24, 
    fontWeight: 'bold', 
    marginTop: Espaciado.md,
    marginBottom: Espaciado.sm 
  },
  restrictedSubtitle: { 
    color: Tema.dark.textSecondary, 
    textAlign: 'center' 
  },
});