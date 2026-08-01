const { Subcategoria, Categoria, Producto } = require('../models');

// GET /api/subcategorias — Listar todas (solo activas opcional)
const listarSubcategorias = async (req, res) => {
  try {
    const subcategorias = await Subcategoria.findAll({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json(subcategorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener subcategorías' });
  }
};

// GET /api/subcategorias/:id — Ver una subcategoría con productos
const verSubcategoria = async (req, res) => {
  try {
    const subcategoria = await Subcategoria.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        {
          model: Producto,
          as: 'productos',
          where: { activo: true },
          required: false // importante para que no falle si no hay productos
        }
      ]
    });

    if (!subcategoria) {
      return res.status(404).json({ mensaje: 'Subcategoría no encontrada' });
    }

    res.json(subcategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la subcategoría' });
  }
};

// GET /api/subcategorias/categoria/:categoriaId — Filtrar por categoría
const listarPorCategoria = async (req, res) => {
  try {
    const subcategorias = await Subcategoria.findAll({
      where: {
        categoriaId: req.params.categoriaId,
        activo: true
      },
      order: [['nombre', 'ASC']]
    });

    res.json(subcategorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener subcategorías' });
  }
};

// ── ADMIN ──────────────────────────────────────

// POST /api/subcategorias — Crear
const crearSubcategoria = async (req, res) => {
  try {
    const { nombre, descripcion, categoriaId } = req.body;

    const subcategoria = await Subcategoria.create({
      nombre,
      descripcion,
      categoriaId
    });

    res.status(201).json({
      mensaje: 'Subcategoría creada correctamente',
      subcategoria
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: error.message });
  }
};

// PUT /api/subcategorias/:id — Editar
const editarSubcategoria = async (req, res) => {
  try {
    const { nombre, descripcion, categoriaId } = req.body;

    const subcategoria = await Subcategoria.findByPk(req.params.id);

    if (!subcategoria) {
      return res.status(404).json({ mensaje: 'Subcategoría no encontrada' });
    }

    await subcategoria.update({
      nombre,
      descripcion,
      categoriaId
    });

    res.json({
      mensaje: 'Subcategoría actualizada correctamente',
      subcategoria
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: error.message });
  }
};

// PATCH /api/subcategorias/:id/activar — Activar/desactivar
const activarDesactivar = async (req, res) => {
  try {
    const subcategoria = await Subcategoria.findByPk(req.params.id);

    if (!subcategoria) {
      return res.status(404).json({ mensaje: 'Subcategoría no encontrada' });
    }

    await subcategoria.update({ activo: !subcategoria.activo });

    res.json({
      mensaje: `Subcategoría ${subcategoria.activo ? 'activada' : 'desactivada'} correctamente`,
      subcategoria
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: error.message });
  }
};

// DELETE /api/subcategorias/:id — Eliminar
const eliminarSubcategoria = async (req, res) => {
  try {
    const subcategoria = await Subcategoria.findByPk(req.params.id);

    if (!subcategoria) {
      return res.status(404).json({ mensaje: 'Subcategoría no encontrada' });
    }

    await subcategoria.destroy();

    res.json({ mensaje: 'Subcategoría eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: error.message });
  }
};

module.exports = {
  listarSubcategorias,
  verSubcategoria,
  listarPorCategoria,
  crearSubcategoria,
  editarSubcategoria,
  activarDesactivar,
  eliminarSubcategoria
};