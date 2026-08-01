const normalizarRol = (rol) => {
  if (rol === undefined || rol === null || rol === '') return null;

  const valor = String(rol).trim().toLowerCase();

  if (valor === 'administrador' || valor === 'admin') return 'admin';
  if (valor === 'auxiliar') return 'auxiliar';
  if (valor === 'cliente') return 'cliente';

  return valor;
};

module.exports = { normalizarRol };
