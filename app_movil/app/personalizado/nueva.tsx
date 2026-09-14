import React, { useContext, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/src/contexto/ContextoAuth';
import { PRIORIDADES_PERSONALIZADO } from '@/src/utilidades/constantes';
import servicioPersonalizado from '@/src/servicios/servicioPersonalizado';
import { BotonEnvioFormulario, CampoTextoFormulario, FormularioSolicitudLayout, SelectorFormulario } from '@/components/formulario-solicitud';

export default function NuevoPersonalizadoScreen() {
  const router = useRouter();
  const { usuario } = useContext(AuthContext);
  const [nombreCompleto, setNombreCompleto] = useState(usuario ? `${usuario.Nombre} ${usuario.Apellidos || ''}`.trim() : '');
  const [correo, setCorreo] = useState(usuario?.Correo || '');
  const [numeroTelefono, setNumeroTelefono] = useState(usuario?.Celular || '');
  const [destinatario, setDestinatario] = useState('');
  const [descripcionIdea, setDescripcionIdea] = useState('');
  const [elementosEsenciales, setElementosEsenciales] = useState('');
  const [prioridadCliente, setPrioridadCliente] = useState(PRIORIDADES_PERSONALIZADO[0]);
  const [comentariosAdicionales, setComentariosAdicionales] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async () => {
    if (!nombreCompleto || !correo || !numeroTelefono || !descripcionIdea || !destinatario) {
      Alert.alert('Error', 'Por favor llena todos los campos obligatorios (*)');
      return;
    }
    try {
      setCargando(true);
      await servicioPersonalizado.crearPersonalizado({ nombreCompleto, correo, numeroTelefono, destinatario, descripcionIdea, elementosEsenciales, prioridadCliente, comentariosAdicionales });
      Alert.alert('¡Solicitud Enviada!', 'Hemos recibido tu idea. Nos pondremos en contacto contigo pronto para hacerla realidad.', [{ text: 'Ver mis solicitudes', onPress: () => router.replace('/personalizado') }]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar la solicitud');
      setCargando(false);
    }
  };

  return <FormularioSolicitudLayout titulo={<>Proyecto <Text style={{ color: '#ff0844' }}>Personalizado</Text></>} subtitulo="Cuéntanos tu idea y la haremos realidad.">
    <Text style={{ color: '#c9a060', fontWeight: 'bold', marginBottom: 16 }}>Tus Datos</Text>
    <CampoTextoFormulario label="Nombre Completo *" value={nombreCompleto} onChangeText={setNombreCompleto} placeholder="Tu nombre completo" />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <CampoTextoFormulario label="Correo *" value={correo} onChangeText={setCorreo} placeholder="tu@correo.com" keyboardType="email-address" autoCapitalize="none" containerStyle={{ flex: 1, marginRight: 8 }} />
      <CampoTextoFormulario label="Teléfono *" value={numeroTelefono} onChangeText={setNumeroTelefono} placeholder="300 000 0000" keyboardType="phone-pad" containerStyle={{ flex: 1 }} />
    </View>
    <Text style={{ color: '#c9a060', fontWeight: 'bold', marginBottom: 16 }}>Detalles de tu Idea</Text>
    <CampoTextoFormulario label="¿Para quién es? (Destinatario) *" value={destinatario} onChangeText={setDestinatario} placeholder="Ej. Mi pareja, Mi madre, Yo mismo..." />
    <CampoTextoFormulario label="Describe tu Idea *" value={descripcionIdea} onChangeText={setDescripcionIdea} placeholder="Cuéntanos con detalle qué tienes en mente..." multiline numberOfLines={4} />
    <CampoTextoFormulario label="Elementos Esenciales" value={elementosEsenciales} onChangeText={setElementosEsenciales} placeholder="Ej. Fotos específicas, colores, frases..." multiline numberOfLines={3} minHeight={80} />
    <SelectorFormulario label="Prioridad Principal" value={prioridadCliente} options={PRIORIDADES_PERSONALIZADO} onChange={setPrioridadCliente} />
    <CampoTextoFormulario label="Comentarios Adicionales" value={comentariosAdicionales} onChangeText={setComentariosAdicionales} placeholder="Cualquier otro detalle que debamos saber..." multiline numberOfLines={3} minHeight={80} />
    <BotonEnvioFormulario cargando={cargando} texto="ENVIAR SOLICITUD" onPress={manejarEnvio} />
  </FormularioSolicitudLayout>;
}
