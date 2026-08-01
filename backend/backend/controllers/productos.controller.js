const { Producto, Categoria } = require('../models');

// GET /api/productos
const listarProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { Activo: true },
      include: [{ model: Categoria, as: 'categoria', attributes: ['Id_Categoria', 'Nombre_Categoria'] }]
    });
    res.json(productos.map(p => ({ ...p.toJSON(), imagenUrl: p.obtenerUrlImagen() })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
};

// GET /api/productos/:id
const verProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [{ model: Categoria, as: 'categoria', attributes: ['Id_Categoria', 'Nombre_Categoria'] }]
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Si está desactivado, solo admin puede verlo
    if (!producto.Activo) {
      const esAdmin = req.usuarioRol === 'admin';
      if (!esAdmin) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
    }

    res.json({ ...producto.toJSON(), imagenUrl: producto.obtenerUrlImagen() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener producto' });
  }
};

// GET /api/productos/categoria/:categoriaId
const listarPorCategoria = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { Id_Categoria: req.params.categoriaId, Activo: true }
    });
    res.json(productos.map(p => ({ ...p.toJSON(), imagenUrl: p.obtenerUrlImagen() })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al filtrar productos' });
  }
};

// GET /api/productos/admin/todos
const listarTodos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [{ model: Categoria, as: 'categoria', attributes: ['Id_Categoria', 'Nombre_Categoria'] }]
    });
    res.json(productos.map(p => ({ ...p.toJSON(), imagenUrl: p.obtenerUrlImagen() })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
};

// POST /api/productos/admin
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoriaId, stock } = req.body;
    const imagen = req.file ? req.file.filename : null;

    const producto = await Producto.create({
      Nombre_Producto: nombre,
      Descripcion_Producto: descripcion,
      Precio_Producto: precio,
      Id_Categoria: categoriaId,
      Imagen_Producto: imagen,
      Stock: stock || 0,
      Activo: true
    });

    res.status(201).json({ mensaje: 'Producto creado correctamente', producto });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: error.message });
  }
};

// PUT /api/productos/admin/:id
const editarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const { nombre, descripcion, precio, categoriaId, stock } = req.body;
    const imagen = req.file ? req.file.filename : producto.Imagen_Producto;

    await producto.update({
      Nombre_Producto: nombre,
      Descripcion_Producto: descripcion,
      Precio_Producto: precio,
      Id_Categoria: categoriaId,
      Imagen_Producto: imagen,
      Stock: stock ?? producto.Stock
    });

    res.json({ mensaje: 'Producto actualizado correctamente', producto });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: error.message });
  }
};

// PATCH /api/productos/admin/:id/activar
const activarDesactivar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    await producto.update({ Activo: !producto.Activo });
    res.json({ mensaje: `Producto ${producto.Activo ? 'activado' : 'desactivado'}`, producto });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: error.message });
  }
};

// DELETE /api/productos/admin/:id
const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    await producto.destroy();
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: error.message });
  }
};

module.exports = {
  listarProductos, verProducto, listarPorCategoria,
  listarTodos, crearProducto, editarProducto,
  activarDesactivar, eliminarProducto
};