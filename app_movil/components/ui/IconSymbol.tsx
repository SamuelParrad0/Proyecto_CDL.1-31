// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, ComponentProps<typeof MaterialIcons>['name']> = {
  // Navegación
  'house.fill': 'home',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'expand-more',
  'arrow.right': 'arrow-forward',
  'arrow.left': 'arrow-back',

  // Carrito y compras
  'cart.fill': 'shopping-cart',
  'cart.badge.plus': 'add-shopping-cart',
  'creditcard.fill': 'credit-card',
  'bag.fill': 'account-balance-wallet',

  // Personas y cuenta
  'person.fill': 'person',
  'person.2.fill': 'people',
  'person.crop.circle.badge.exclamationmark': 'person-outline',

  // Comunicación
  'paperplane.fill': 'send',
  'phone.fill': 'phone',

  // Edición y acciones
  'pencil': 'edit',
  'trash': 'delete',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'xmark.circle.fill': 'cancel',
  'checkmark.circle.fill': 'check-circle',
  'square.and.arrow.down.fill': 'save',
  'rectangle.portrait.and.arrow.right': 'logout',
  'xmark': 'close',

  // Calendario y tiempo
  'calendar': 'event',
  'calendar.badge.plus': 'event-available',
  'calendar.badge.exclamationmark': 'event-busy',

  // Multimedia y visual
  'camera.fill': 'camera-alt',
  'photo.on.rectangle.angled': 'photo-library',
  'sparkles': 'auto-awesome',
  'wand.and.stars': 'auto-fix-high',
  'star.circle.fill': 'star',

  // Mapas y ubicación
  'map.fill': 'map',
  'building.2.fill': 'business',
  'building.columns.fill': 'account-balance',

  // Alertas e información
  'exclamationmark.triangle.fill': 'warning',
  'flag.fill': 'flag',
  'questionmark.circle.fill': 'help',
  'lock.fill': 'lock',
  'iphone': 'smartphone',

  // Categorías y admin
  'tag.fill': 'label',
  'gearshape.fill': 'settings',
  'cube.box.fill': 'inventory',
  'doc.text.fill': 'description',
  'folder.fill': 'folder',
  'shippingbox.fill': 'local-shipping',
  'envelope.fill': 'email',
  'calendar.badge.clock': 'schedule',
  'camera.macro': 'camera-alt',
  'wand.and.stars.inverse': 'auto-fix-high',
  'magnifyingglass': 'search',

  // Código (original)
  'chevron.left.forwardslash.chevron.right': 'code',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
