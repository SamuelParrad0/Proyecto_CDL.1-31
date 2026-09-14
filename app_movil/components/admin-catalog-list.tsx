import React, { ReactNode } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';

type AdminCatalogListProps<Item> = Readonly<{
  titulo: string;
  cantidad: number;
  placeholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onAdd: () => void;
  cargando: boolean;
  refrescando: boolean;
  onRefresh: () => void;
  data: Item[];
  renderItem: ({ item }: { item: Item }) => ReactNode;
  keyExtractor: (item: Item) => string;
  emptyText: string;
  children?: ReactNode;
}>;

export function AdminCatalogList<Item>({
  titulo, cantidad, placeholder, searchQuery, onSearchChange, onBack, onAdd,
  cargando, refrescando, onRefresh, data, renderItem, keyExtractor, emptyText, children,
}: AdminCatalogListProps<Item>) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={onBack}>
          <IconSymbol name="chevron.left" size={24} color={Tema.dark.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.titulo}>Gestión de <Text style={styles.textoDorado}>{titulo}</Text></Text>
          <Text style={styles.subtitulo}>{cantidad} {titulo.toLowerCase()} registrados</Text>
        </View>
        <TouchableOpacity style={styles.botonAgregarHeader} onPress={onAdd}>
          <IconSymbol name="plus" size={24} color={Tema.dark.tint} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={Tema.dark.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={Tema.dark.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={Tema.dark.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {cargando && !refrescando ? (
        <View style={styles.cargandoContenedor}><ActivityIndicator size="large" color={Tema.dark.tint} /></View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={Tema.dark.tint} />}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>{searchQuery ? `No se encontraron ${titulo.toLowerCase()} coincidentes.` : emptyText}</Text></View>}
        />
      )}
      {children}
    </SafeAreaView>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: Tema.dark.background },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, padding: Espaciado.lg, borderBottomWidth: 1, borderBottomColor: Tema.dark.border },
  headerTextContainer: { flex: 1 },
  botonVolver: { padding: Espaciado.sm, marginRight: Espaciado.sm, marginLeft: -Espaciado.sm },
  botonAgregarHeader: { padding: Espaciado.sm },
  titulo: { fontSize: 22, fontWeight: 'bold' as const, color: Tema.dark.text },
  textoDorado: { color: Tema.dark.dorado || '#c9a060' },
  subtitulo: { color: Tema.dark.textSecondary, fontSize: 13 },
  cargandoContenedor: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const },
  searchContainer: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: Tema.dark.surface, marginHorizontal: Espaciado.lg, marginTop: Espaciado.md, paddingHorizontal: Espaciado.md, borderRadius: RadioBorde.md, borderWidth: 1, borderColor: Tema.dark.border, height: 44 },
  searchInput: { flex: 1, color: Tema.dark.text, marginLeft: Espaciado.sm, fontSize: 14 },
  lista: { padding: Espaciado.lg, gap: Espaciado.md },
  empty: { alignItems: 'center' as const, marginTop: Espaciado.xl },
  emptyText: { color: Tema.dark.textSecondary },
};
