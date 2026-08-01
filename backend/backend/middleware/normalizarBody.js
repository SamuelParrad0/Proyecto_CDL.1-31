/**
 * Convierte PascalCase/snake_case a camelCase automáticamente
 * Así el backend acepta tanto:
 *   { "Comentarios_Adicionales": "hija" }
 * como:
 *   { "comentariosAdicionales": "hija" }
 */

// Convierte "Comentarios_Adicionales" → "comentariosAdicionales"
const toCamel = (str) => {
  return str
    .toLowerCase()
    .replace(/[_](.)/g, (_, c) => c.toUpperCase());
};

// Normaliza todas las keys del body a camelCase
const normalizarBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const normalized = {};
    for (const key of Object.keys(req.body)) {
      const camelKey = toCamel(key);
      // Guarda tanto el original como el camelCase
      normalized[key] = req.body[key];
      normalized[camelKey] = req.body[key];
    }
    req.body = normalized;
  }
  next();
};

module.exports = { normalizarBody };