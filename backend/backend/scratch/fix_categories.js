const { sequelize } = require('../config/database');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

async function fixCategories() {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.authenticate();
    console.log('📦 Iniciando limpieza de categorías...');

    // 1. Crear la categoría única deseada
    const [categoriaPrincipal, created] = await Categoria.findOrCreate({
      where: { Nombre_Categoria: 'Recuerdos para personas en nuestros corazones' },
      defaults: {
        Descripcion_Categoria: 'Figuras hechas y realizadas con gran detalle de madera',
        Activo: true
      },
      transaction
    });

    console.log(`${created ? '✅ Creada' : 'ℹ️ Ya existía'} la categoría principal: ID ${categoriaPrincipal.Id_Categoria}`);

    // 2. Mover TODOS los productos a esta categoría
    const [productosActualizados] = await Producto.update(
      { Id_Categoria: categoriaPrincipal.Id_Categoria },
      { where: {}, transaction }
    );
    console.log(`✅ ${productosActualizados} productos movidos a la categoría principal.`);

    // 3. Eliminar todas las categorías excepto la principal
    const eliminadas = await Categoria.destroy({
      where: {
        Id_Categoria: { [require('sequelize').Op.ne]: categoriaPrincipal.Id_Categoria }
      },
      transaction
    });
    console.log(`✅ ${eliminadas} categorías antiguas eliminadas.`);

    await transaction.commit();
    console.log('✨ Proceso completado con éxito.');

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('❌ Error durante el proceso:', error);
  } finally {
    await sequelize.close();
  }
}

fixCategories();
