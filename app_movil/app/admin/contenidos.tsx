import React, { useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { AdminModuleHub } from '@/components/admin-module-hub';

export default function AdminContenidosScreen() {
  const router = useRouter();
  const { esAdmin, esAuxiliar } = useContext(AuthContext);
  if (!esAdmin && !esAuxiliar) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <AdminModuleHub
      router={router}
      titulo="Contenidos"
      bannerIcono="doc.text.fill"
      bannerTexto="Gestiona todo el contenido visible para tus clientes desde aquí."
      modulos={[
        { icono: 'camera.fill', titulo: 'Gestión de Productos', subtitulo: 'Inventario y catálogo de la tienda', descripcion: 'Administra los productos disponibles, precios, imágenes y estado de visibilidad.', ruta: '/admin/productos', color: '#c9a060' },
        { icono: 'cube.box.fill', titulo: 'Gestión de Paquetes', subtitulo: 'Administrar paquetes de servicios', descripcion: 'Crea y edita paquetes de servicios con precios, descripciones e imágenes.', ruta: '/admin/paquetes', color: '#3b82f6' },
      ]}
    />
  );
}
