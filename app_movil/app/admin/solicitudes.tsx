import React, { useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { AdminModuleHub } from '@/components/admin-module-hub';

export default function AdminSolicitudesScreen() {
  const router = useRouter();
  const { puedeGestionarPanel, esAuxiliar } = useContext(AuthContext);
  if (!puedeGestionarPanel) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <AdminModuleHub
      router={router}
      titulo={esAuxiliar ? 'Auxiliar' : 'Solicitudes'}
      bannerIcono="flag.fill"
      bannerTexto="Gestiona pedidos físicos y reservas de paquetes fotográficos de los clientes desde aquí."
      modulos={[
        { icono: 'shippingbox.fill', titulo: 'Gestión de Pedidos', subtitulo: 'Aprobar y enviar pedidos físicos', descripcion: 'Administra los pedidos realizados por los clientes, actualiza el estado de envío y seguimiento.', ruta: '/admin/pedidos', color: '#f59e0b' },
        { icono: 'calendar.badge.clock', titulo: 'Solicitudes de Paquetes', subtitulo: 'Reservas de paquetes fotográficos', descripcion: 'Visualiza y gestiona todas las solicitudes de reserva de paquetes.', ruta: '/admin/citas', color: '#ec4899' },
      ]}
    />
  );
}
