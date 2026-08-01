const { Carrito, Producto } = require('../models');

// POST /api/carrito
const agregarProducto = async (req, res) => {
  try {
    const { productoId, cantidad = 1 } = req.body;
    const usuarioId = req.usuarioId;

    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no existe' });
    }

    const itemExistente = await Carrito.findOne({
      where: { Id_Usuario: usuarioId, Id_Producto: productoId }
    });

    const precioTotal = parseFloat(producto.Precio_Producto) * cantidad;

    if (itemExistente) {
      itemExistente.Cantidad_Productos += cantidad;
      itemExistente.Precio_Total = parseFloat(itemExistente.Precio_Total) + precioTotal;
      await itemExistente.save();
      return res.json({ ok: true, mensaje: 'Cantidad actualizada', item: itemExistente });
    }

    const nuevoItem = await Carrito.create({
      Id_Usuario: usuarioId,
      Id_Producto: productoId,
      Cantidad_Productos: cantidad,
      Precio_Total: precioTotal,
      Estado_Carrito: 'activo',
      Fecha_Creacion: new Date()
    });

    res.status(201).json({ ok: true, mensaje: 'Producto agregado al carrito', item: nuevoItem });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


// GET /api/carrito
const verCarrito = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    const items = await Carrito.findAll({
      where: { Id_Usuario: usuarioId },
      include: [{ model: Producto, as: 'producto' }]
    });

    let total = 0;
    const itemsFormateados = items.map(item => {
      total += parseFloat(item.Precio_Total);
      return item.toJSON();
    });

    res.json({ ok: true, items: itemsFormateados, total, cantidadItems: items.length });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener el carrito' });
  }
};


// GET /api/carrito/:id
const verItemPorId = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';

    const where = esAdmin
      ? { Id_Carrito: req.params.id }
      : { Id_Carrito: req.params.id, Id_Usuario: req.usuarioId };

    const item = await Carrito.findOne({
      where,
      include: [{ model: Producto, as: 'producto' }]
    });

    if (!item) {
      return res.status(404).json({ ok: false, mensaje: 'Item no encontrado' });
    }

    res.json({ ok: true, item });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener el item' });
  }
};


// PUT /api/carrito/:id
const actualizarCantidad = async (req, res) => {
  try {
    const { cantidad } = req.body;
    const usuarioId = req.usuarioId;

    const item = await Carrito.findOne({
      where: { Id_Carrito: req.params.id, Id_Usuario: usuarioId }
    });

    if (!item) {
      return res.status(404).json({ ok: false, mensaje: 'Item no encontrado' });
    }

    const producto = await Producto.findByPk(item.Id_Producto);
    
    if (cantidad > producto.Stock) {
      return res.status(400).json({ ok: false, mensaje: `Solo hay ${producto.Stock} unidades disponibles.` });
    }
    if (cantidad < 1) {
      return res.status(400).json({ ok: false, mensaje: 'La cantidad debe ser al menos 1' });
    }

    item.Cantidad_Productos = cantidad;
    item.Precio_Total = parseFloat(producto.Precio_Producto) * cantidad;
    await item.save();

    res.json({ ok: true, mensaje: 'Cantidad actualizada', item });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


// PATCH /api/carrito/:id/toggle
const toggleItem = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';

    const where = esAdmin
      ? { Id_Carrito: req.params.id }
      : { Id_Carrito: req.params.id, Id_Usuario: req.usuarioId };

    const item = await Carrito.findOne({ where });

    if (!item) {
      return res.status(404).json({ ok: false, mensaje: 'Item no encontrado' });
    }

    const nuevoEstado = item.Estado_Carrito === 'activo' ? 'inactivo' : 'activo';
    await item.update({ Estado_Carrito: nuevoEstado });

    res.json({ ok: true, mensaje: `Item ${nuevoEstado}`, item });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};


// DELETE /api/carrito/:id
const eliminarItem = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    const item = await Carrito.findOne({
      where: { Id_Carrito: req.params.id, Id_Usuario: usuarioId }
    });

    if (!item) {
      return res.status(404).json({ ok: false, mensaje: 'Item no encontrado' });
    }

    await item.destroy();

    res.json({ ok: true, mensaje: 'Producto eliminado' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar' });
  }
};


// DELETE /api/carrito
const vaciarCarrito = async (req, res) => {
  try {
    await Carrito.destroy({ where: { Id_Usuario: req.usuarioId } });
    res.json({ ok: true, mensaje: 'Carrito vaciado' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al vaciar carrito' });
  }
};


module.exports = {
  agregarProducto,
  verCarrito,
  verItemPorId,
  actualizarCantidad,
  toggleItem,
  eliminarItem,
  vaciarCarrito
};