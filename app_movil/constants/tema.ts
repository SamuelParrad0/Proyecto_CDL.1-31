import { COLORES } from '../src/utilidades/constantes';

/**
 * TEMA VISUAL DE LA APLICACIÓN
 * Basado en la paleta del frontend (Oscuro/Rojo Premium)
 */

const tintColorLight = COLORES.rojo;
const tintColorDark = COLORES.rojo;

export const Tema = {
  light: {
    text: COLORES.textoPrimario,
    textSecondary: COLORES.textoSecundario,
    background: COLORES.blanco,
    surface: COLORES.superficie,
    tint: tintColorLight,
    icon: COLORES.textoSecundario,
    tabIconDefault: COLORES.textoSecundario,
    tabIconSelected: tintColorLight,
    border: COLORES.borde,
    borderRed: '#E53935',
    error: '#D32F2F',
    dorado: '#c9a060',
    exito: COLORES.exito,
    info: COLORES.info,
    advertencia: COLORES.advertencia,
  },
  dark: {
    text: COLORES.textoPrimario,
    textSecondary: COLORES.textoSecundario,
    background: COLORES.fondo0,
    surface: COLORES.superficie,
    surface2: COLORES.superficie2,
    tint: tintColorDark,
    icon: COLORES.textoSecundario,
    tabIconDefault: COLORES.textoSecundario,
    tabIconSelected: tintColorDark,
    border: COLORES.borde,
    borderRed: COLORES.bordeRojo,
    error: COLORES.error,
    dorado: '#c9a060',
    exito: COLORES.exito,
    info: COLORES.info,
    advertencia: COLORES.advertencia,
  },
};

export const Espaciado = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RadioBorde = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  redondo: 9999,
};

// Mapeo directo al Tema oscuro como el predeterminado para mantener la identidad visual
export const ColorActual = Tema.dark;
