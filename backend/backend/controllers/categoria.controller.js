const { Categoria, Producto } = require('../models');

// ==========================================
// LISTAR CATEGORIAS
// ==========================================
const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { Activo: true },
      order: [['Nombre_Categoria', 'ASC']]
    });

    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener categorías' });
  }
};

// ==========================================
// VER CATEGORIA
// ==========================================
const listarTodasAdmin = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['Nombre_Categoria', 'ASC']]
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

const verCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id, {
      include: [{
        model: Producto,
        as: 'productos'
      }]
    });

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    res.json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la categoría' });
  }
};

// ==========================================
// CREAR
// ==========================================
const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.create({
      Nombre_Categoria: nombre,
      Descripcion_Categoria: descripcion
    });

    res.status(201).json({
      mensaje: 'Categoría creada',
      categoria
    });

  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ==========================================
// EDITAR
// ==========================================
const editarCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.findByPk(req.params.id);

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    await categoria.update({
      Nombre_Categoria: nombre,
      Descripcion_Categoria: descripcion
    });

    res.json({
      mensaje: 'Categoría actualizada',
      categoria
    });

  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ==========================================
// ACTIVAR / DESACTIVAR
// ==========================================
const activarDesactivar = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    await categoria.update({
      Activo: !categoria.Activo
    });

    res.json({
      mensaje: `Categoría ${categoria.Activo ? 'activada' : 'desactivada'}`,
      categoria
    });

  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ==========================================
// ELIMINAR
// ==========================================
const eliminarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    await categoria.destroy();

    res.json({ mensaje: 'Categoría eliminada' });

  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

module.exports = {
  listarCategorias,
  listarTodasAdmin,
  verCategoria,
  crearCategoria,
  editarCategoria,
  activarDesactivar,
  eliminarCategoria
};