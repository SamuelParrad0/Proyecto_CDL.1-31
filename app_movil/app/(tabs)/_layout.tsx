import { Tabs } from 'expo-router';
import React, { useContext } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Tema, Espaciado } from '@/constants/tema';
import { CarritoContext } from '@/src/contexto/ContextoCarrito';

type TabIconProps = Readonly<{
  color: string;
}>;

type CarritoIconProps = Readonly<{
  color: string;
  totalItems: number;
}>;

const renderIconoTienda = (props: TabIconProps) => (
  <IconSymbol size={28} name="house.fill" color={props.color} />
);

const renderIconoExplorar = (props: TabIconProps) => (
  <IconSymbol size={28} name="sparkles" color={props.color} />
);

const renderIconoCarrito = (props: CarritoIconProps) => (
  <View>
    <IconSymbol size={28} name="cart.fill" color={props.color} />
    {props.totalItems > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{props.totalItems}</Text>
      </View>
    )}
  </View>
);

const renderIconoCuenta = (props: TabIconProps) => (
  <IconSymbol size={28} name="person.fill" color={props.color} />
);

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
          tabBarIcon: (tabProps) => renderIconoTienda({ color: tabProps.color }),
        }}
      />
      
      <Tabs.Screen
        name="explorar"
        options={{
          title: 'Explorar',
          tabBarIcon: (tabProps) => renderIconoExplorar({ color: tabProps.color }),
        }}
      />
      
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: (tabProps) => renderIconoCarrito({ color: tabProps.color, totalItems }),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Cuenta',
          tabBarIcon: (tabProps) => renderIconoCuenta({ color: tabProps.color }),
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