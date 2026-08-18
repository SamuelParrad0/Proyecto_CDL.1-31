import { Tabs } from 'expo-router';
import React, { useContext } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Tema, Espaciado } from '@/constants/tema';
import { CarritoContext } from '@/src/contexto/ContextoCarrito';

// Componentes de íconos definidos fuera del componente padre
function IconoTienda({ color }: { color: string }) {
  return <IconSymbol size={28} name="house.fill" color={color} />;
}

function IconoExplorar({ color }: { color: string }) {
  return <IconSymbol size={28} name="sparkles" color={color} />;
}

function IconoCarrito({ color, totalItems }: { color: string; totalItems: number }) {
  return (
    <View>
      <IconSymbol size={28} name="cart.fill" color={color} />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems}</Text>
        </View>
      )}
    </View>
  );
}

function IconoCuenta({ color }: { color: string }) {
  return <IconSymbol size={28} name="person.fill" color={color} />;
}

export default function TabLayout() {
  const { totalItems } = useContext(CarritoContext);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Tema.dark.background,
          borderBottomWidth: 1,
          borderBottomColor: Tema.dark.borderRed,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Tema.dark.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          letterSpacing: 1,
        },
        tabBarActiveTintColor: Tema.dark.tint,
        tabBarInactiveTintColor: Tema.dark.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Tema.dark.background,
          borderTopColor: Tema.dark.borderRed,
          borderTopWidth: 1,
          paddingTop: Platform.OS === 'ios' ? Espaciado.sm : 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color }) => <IconoTienda color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <IconoExplorar color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color }) => <IconoCarrito color={color} totalItems={totalItems} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <IconoCuenta color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: Tema.dark.tint,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});