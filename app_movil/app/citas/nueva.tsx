import React, { useContext, useState } from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { TIPOS_EVENTO } from '@/src/utilidades/constantes';
import servicioCitas from '@/src/servicios/servicioCitas';
import { BotonEnvioFormulario, CampoTextoFormulario, FormularioSolicitudLayout, SelectorFormulario } from '@/components/formulario-solicitud';

export default function NuevaCitaScreen() {
  const { paqueteId, paqueteNombre } = useLocalSearchParams();
  const router = useRouter();
  const { usuario } = useContext(AuthContext);
  const [nombreCompleto, setNombreCompleto] = useState(usuario ? `${usuario.Nombre} ${usuario.Apellidos || ''}`.trim() : '');
  const [correo, setCorreo] = useState(usuario?.Correo || '');
  const [numeroTelefono, setNumeroTelefono] = useState(usuario?.Celular || '');
  const [tipoEvento, setTipoEvento] = useState(TIPOS_EVENTO[0]);
  const [fechaEvento, setFechaEvento] = useState('');
  const [numeroInvitados, setNumeroInvitados] = useState('');
  const [informacionAdicional, setInformacionAdicional] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async () => {
    if (!nombreCompleto || !correo || !numeroTelefono || !fechaEvento) {
      Alert.alert('Error', 'Por favor llena todos los campos obligatorios (*)');
      return;
    }
    try {
      setCargando(true);
      await servicioCitas.crearCita({ paqueteId: Number(paqueteId), nombreCompleto, correo, numeroTelefono, tipoEvento, fechaEvento, numeroInvitados: numeroInvitados ? Number(numeroInvitados) : null, informacionAdicional });
      Alert.alert('¡Reserva Exitosa!', 'Tu cita ha sido registrada. Nos pondremos en contacto contigo pronto.', [{ text: 'Entendido', onPress: () => router.replace('/citas') }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la reserva');
      setCargando(false);
    }
  };

  return <FormularioSolicitudLayout titulo={<>Reservar <Text style={{ color: '#ff0844' }}>Paquete</Text></>} subtitulo={`Estás reservando el paquete: ${paqueteNombre || 'Fotográfico'}`}>
    <CampoTextoFormulario label="Nombre Completo *" value={nombreCompleto} onChangeText={setNombreCompleto} placeholder="Ej. Juan Pérez" />
    <CampoTextoFormulario label="Correo Electrónico *" value={correo} onChangeText={setCorreo} placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <CampoTextoFormulario label="Teléfono *" value={numeroTelefono} onChangeText={setNumeroTelefono} placeholder="Ej. 300 000 0000" keyboardType="phone-pad" containerStyle={{ flex: 1, marginRight: 8 }} />
      <CampoTextoFormulario label="Invitados" value={numeroInvitados} onChangeText={setNumeroInvitados} placeholder="Ej. 50" keyboardType="numeric" containerStyle={{ flex: 1 }} />
    </View>
    <SelectorFormulario label="Tipo de Evento *" value={tipoEvento} options={TIPOS_EVENTO} onChange={setTipoEvento} />
    <CampoTextoFormulario label="Fecha del Evento *" value={fechaEvento} onChangeText={setFechaEvento} placeholder="YYYY-MM-DD" helperText="Formato: Año-Mes-Día (Ej. 2024-12-25)" />
    <CampoTextoFormulario label="Información Adicional" value={informacionAdicional} onChangeText={setInformacionAdicional} placeholder="Cuéntanos más detalles sobre tu evento..." multiline numberOfLines={4} />
    <BotonEnvioFormulario cargando={cargando} texto="CONFIRMAR RESERVA" onPress={manejarEnvio} />
  </FormularioSolicitudLayout>;
}
