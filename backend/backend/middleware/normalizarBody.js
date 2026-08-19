const toCamel = (str) => {
  return str
    .toLowerCase()
    .replace(/_([a-z0-9])/gi, (_, c) => c.toUpperCase());
};

const normalizarBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const normalized = {};
    for (const key of Object.keys(req.body)) {
      const camelKey = toCamel(key);
      normalized[key] = req.body[key];
      normalized[camelKey] = req.body[key];
    }
    req.body = normalized;
  }
  next();
};

module.exports = { normalizarBody };