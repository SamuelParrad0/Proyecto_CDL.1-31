// ==========================================
// IMPORTACIÓN DE MODELOS
// ==========================================
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Carrito = require('./Carrito');
const Paquete = require('./Paquete');
const ReservaPaquete = require('./Cita');
const Personalizado = require('./Personalizado');
const Direccion = require('./Direccion');
const Opinion = require('./Opinion');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');

// ==========================================
// 1. ROL ↔ USUARIO
// ==========================================
Rol.hasMany(Usuario, {
  foreignKey: 'Id_Rol',
  as: 'usuarios',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Usuario.belongsTo(Rol, {
  foreignKey: 'Id_Rol',
  as: 'Rol',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// ==========================================
// 2. CATEGORIA ↔ PRODUCTO
// ==========================================
Categoria.hasMany(Producto, {
  foreignKey: 'Id_Categoria',
  as: 'productos',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Producto.belongsTo(Categoria, {
  foreignKey: 'Id_Categoria',
  as: 'categoria',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 3. USUARIO ↔ CARRITO
// ==========================================
Usuario.hasMany(Carrito, {
  foreignKey: 'Id_Usuario',
  as: 'carrito',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Carrito.belongsTo(Usuario, {
  foreignKey: 'Id_Usuario',
  as: 'usuario',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 4. CARRITO ↔ PRODUCTO
// ==========================================
Producto.hasMany(Carrito, {
  foreignKey: 'Id_Producto',
  as: 'en_carritos',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Carrito.belongsTo(Producto, {
  foreignKey: 'Id_Producto',
  as: 'producto',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 5. USUARIO ↔ RESERVA_PAQUETE (CITAS)
// ==========================================
Usuario.hasMany(ReservaPaquete, {
  foreignKey: 'Id_Usuario',
  as: 'citas',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

ReservaPaquete.belongsTo(Usuario, {
  foreignKey: 'Id_Usuario',
  as: 'usuario',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 6. PAQUETE ↔ RESERVA_PAQUETE
// ==========================================
Paquete.hasMany(ReservaPaquete, {
  foreignKey: 'Id_Paquete',
  as: 'reservas',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

ReservaPaquete.belongsTo(Paquete, {
  foreignKey: 'Id_Paquete',
  as: 'paquete',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 7. USUARIO ↔ PERSONALIZADO
// ==========================================
Usuario.hasMany(Personalizado, {
  foreignKey: 'Id_Usuario',
  as: 'personalizados',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Personalizado.belongsTo(Usuario, {
  foreignKey: 'Id_Usuario',
  as: 'usuario',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 8. USUARIO ↔ DIRECCION
// ==========================================
Usuario.hasMany(Direccion, {
  foreignKey: 'Id_Usuario',
  as: 'direcciones',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Direccion.belongsTo(Usuario, {
  foreignKey: 'Id_Usuario',
  as: 'usuario',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 9. USUARIO ↔ OPINION
// ==========================================
Usuario.hasMany(Opinion, {
  foreignKey: 'Id_Usuario',
  as: 'opiniones',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Opinion.belongsTo(Usuario, {
  foreignKey: 'Id_Usuario',
  as: 'usuario',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// ==========================================
// 10. USUARIO ↔ PEDIDO
// ==========================================
Usuario.hasMany(Pedido, {
  foreignKey: 'usuarioId',
  sourceKey: 'Id_Usuario',
  as: 'pedidos',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Pedido.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  targetKey: 'Id_Usuario',
  as: 'usuario',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 11. PEDIDO ↔ DETALLEPEDIDO
// ==========================================
Pedido.hasMany(DetallePedido, {
  foreignKey: 'pedidoId',
  as: 'detalles',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

DetallePedido.belongsTo(Pedido, {
  foreignKey: 'pedidoId',
  as: 'pedido',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ==========================================
// 12. DETALLEPEDIDO ↔ PRODUCTO
// ==========================================
Producto.hasMany(DetallePedido, {
  foreignKey: 'productoId',
  sourceKey: 'Id_Producto',
  as: 'detallesPedidos',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

DetallePedido.belongsTo(Producto, {
  foreignKey: 'productoId',
  targetKey: 'Id_Producto',
  as: 'producto',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// ==========================================
// INIT
// ==========================================
const initAssociations = () => {
  console.log('🔗 Asociaciones cargadas correctamente');
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  Usuario,
  Rol,
  Categoria,
  Producto,
  Carrito,
  Paquete,
  ReservaPaquete,
  Personalizado,
  Direccion,
  Opinion,
  Pedido,
  DetallePedido,
  initAssociations
};