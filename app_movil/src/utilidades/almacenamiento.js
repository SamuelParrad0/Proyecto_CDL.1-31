/**
 * ALMACENAMIENTO LOCAL — Capa de abstracción sobre AsyncStorage
 * - Intenta persistir en AsyncStorage; si falla, usa respaldo en memoria.
 * - Todas las funciones son async y seguras (no lanzan excepciones).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Respaldo en memoria para cuando AsyncStorage no esté disponible
const memoriaStore = new Map();

/**
 * Ejecuta una función async de forma segura.
 * Si falla, devuelve el valor de respaldo sin lanzar excepción.
 */
async function llamadaSegura(fn, valorRespaldo) {
  try {
    return await fn();
  } catch {
    return valorRespaldo;
  }
}

/**
 * Lee un valor del almacenamiento local.
 * Primero intenta AsyncStorage; si falla, usa el respaldo en memoria.
 */
export async function almacenamientoObtener(clave) {
  const valor = await llamadaSegura(() => AsyncStorage.getItem(clave), null);
  if (valor !== null) return valor;
  return memoriaStore.has(clave) ? memoriaStore.get(clave) : null;
}

/**
 * Guarda un valor en el almacenamiento local.
 * Si AsyncStorage falla, almacena en memoria.
 */
export async function almacenamientoGuardar(clave, valor) {
  const ok = await llamadaSegura(async () => {
    await AsyncStorage.setItem(clave, valor);
    return true;
  }, false);
  // Siempre actualizar memoria como respaldo
  memoriaStore.set(clave, valor);
  return ok;
}

/**
 * Elimina una o varias claves del almacenamiento.
 * @param {string | string[]} claves - Una clave o array de claves a eliminar.
 */
export async function almacenamientoEliminar(claves) {
  const arregloClaves = Array.isArray(claves) ? claves : [claves];
  // Limpiar memoria primero
  arregloClaves.forEach((clave) => memoriaStore.delete(clave));
  await llamadaSegura(async () => {
    if (arregloClaves.length === 1) {
      await AsyncStorage.removeItem(arregloClaves[0]);
    } else {
      await AsyncStorage.multiRemove(arregloClaves);
    }
  }, null);
}

/**
 * Limpia todo el almacenamiento (usar con cuidado).
 */
export async function almacenamientoLimpiarTodo() {
  memoriaStore.clear();
  await llamadaSegura(() => AsyncStorage.clear(), null);
}
