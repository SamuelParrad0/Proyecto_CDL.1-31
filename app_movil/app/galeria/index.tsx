import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tema, Espaciado, RadioBorde } from '@/constants/tema';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function GaleriaScreen() {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  // Imágenes de ejemplo simulando una galería (en el backend no hay endpoint directo para galería independiente de productos)
  const imagenesGaleria = [
    { id: '1', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', categoria: 'Bodas' },
    { id: '2', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', categoria: 'Bodas' },
    { id: '3', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', categoria: 'Retratos' },
    { id: '4', url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', categoria: 'Retratos' },
    { id: '5', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', categoria: 'Eventos' },
    { id: '6', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', categoria: 'Estudio' },
    { id: '7', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80', categoria: 'Estudio' },
    { id: '8', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80', categoria: 'Bodas' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.imagenContenedor} 
      onPress={() => setImagenSeleccionada(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.url }} style={styles.imagenGrid} resizeMode="cover" />
      <View style={styles.overlayImagen}>
        <Text style={styles.categoriaTexto}>{item.categoria}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Galería de <Text style={styles.textoRojo}>Trabajos</Text></Text>
        <Text style={styles.subtitulo}>Inspírate con algunos de nuestros mejores momentos capturados.</Text>
      </View>

      <FlatList
        data={imagenesGaleria}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridLista}
      />

      <Modal visible={!!imagenSeleccionada} transparent={true} animationType="fade">
        <View style={styles.modalFondo}>
          <TouchableOpacity 
            style={styles.botonCerrar} 
            onPress={() => setImagenSeleccionada(null)}
          >
            <IconSymbol name="xmark.circle.fill" size={32} color="#fff" />
          </TouchableOpacity>
          
          {imagenSeleccionada && (
            <Image 
              source={{ uri: imagenSeleccionada.url }} 
              style={styles.imagenCompleta} 
              resizeMode="contain" 
            />
          )}
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
    padding: Espaciado.lg,
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
  gridLista: {
    padding: Espaciado.sm,
  },
  imagenContenedor: {
    flex: 1,
    margin: Espaciado.sm,
    height: 180,
    borderRadius: RadioBorde.md,
    overflow: 'hidden',
    backgroundColor: Tema.dark.surface,
  },
  imagenGrid: {
    width: '100%',
    height: '100%',
  },
  overlayImagen: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Espaciado.xs,
    alignItems: 'center',
  },
  categoriaTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonCerrar: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  imagenCompleta: {
    width: '100%',
    height: '80%',
  },
});
