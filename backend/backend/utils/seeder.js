const { Rol, Categoria, Producto, Usuario, Paquete } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando sembrado de base de datos...');

    // 1. Roles
    const rolesExistentes = await Rol.findAll({ attributes: ['Nombre_Rol'] });
    const rolesDisponibles = new Set(rolesExistentes.map((rol) => rol.Nombre_Rol));

    const rolesPorCrear = [];
    if (!rolesDisponibles.has('admin')) rolesPorCrear.push({ Id_Rol: 1, Nombre_Rol: 'admin' });
    if (!rolesDisponibles.has('cliente')) rolesPorCrear.push({ Id_Rol: 2, Nombre_Rol: 'cliente' });
    if (!rolesDisponibles.has('auxiliar')) rolesPorCrear.push({ Id_Rol: 3, Nombre_Rol: 'auxiliar' });

    if (rolesPorCrear.length > 0) {
      await Rol.bulkCreate(rolesPorCrear);
      console.log('✅ Roles creados');
    }

    // 2. Categorías
    const categoriasExistentes = await Categoria.count();
    if (categoriasExistentes === 0) {
      await Categoria.bulkCreate([
        { Id_Categoria: 1, Nombre_Categoria: 'Bodas', Activo: true },
        { Id_Categoria: 2, Nombre_Categoria: 'Graduaciones', Activo: true },
        { Id_Categoria: 3, Nombre_Categoria: 'Eventos', Activo: true },
        { Id_Categoria: 4, Nombre_Categoria: 'Productos', Activo: true }
      ]);
      console.log('✅ Categorías creadas');
    }

    // 3. Productos
    const productosExistentes = await Producto.count();
    if (productosExistentes === 0) {
      await Producto.bulkCreate([
        {
          Id_Producto: 1,
          Id_Categoria: 4,
          Nombre_Producto: 'Cajita Corazón',
          Precio_Producto: 20000,
          Descripcion_Producto: 'Cajita decorativa con diseño de corazón.',
          Activo: true,
          Stock: 100,
          Imagen: 'Imagenes_Videos/Img-Productos/Cajita-corazon.png'
        },
        {
          Id_Producto: 2,
          Id_Categoria: 4,
          Nombre_Producto: 'Bolsa Sorpresa',
          Precio_Producto: 65000,
          Descripcion_Producto: 'Bolsa llena de sorpresas personalizadas.',
          Activo: true,
          Stock: 100,
          Imagen: 'Imagenes_Videos/Img-Productos/Bolsa-Sorpresa.png'
        },
        {
          Id_Producto: 3,
          Id_Categoria: 4,
          Nombre_Producto: 'Caja Multifotográfica',
          Precio_Producto: 65000,
          Descripcion_Producto: 'Caja con múltiples fotos desplegables.',
          Activo: true,
          Stock: 100,
          Imagen: 'Imagenes_Videos/Img-Productos/Caja-multifotografia.png'
        },
        {
          Id_Producto: 4,
          Id_Categoria: 4,
          Nombre_Producto: 'Libro Emoción',
          Precio_Producto: 95000,
          Descripcion_Producto: 'Libro álbum para capturar emociones.',
          Activo: true,
          Stock: 100,
          Imagen: 'Imagenes_Videos/Img-Productos/Libro-emocion.png'
        }
      ]);
      console.log('✅ Productos creados');
    }

    // 4. Paquetes
    const paquetesExistentes = await Paquete.count();
    if (paquetesExistentes === 0) {
      await Paquete.bulkCreate([
        { Id_Paquete: 1, Nombre_Paquete: 'Paquete Alpha', Precio_Paquete: 1500000, Descripcion_Paquete: 'Ideal para eventos íntimos y sesiones personales.' },
        { Id_Paquete: 2, Nombre_Paquete: 'Paquete Bravo', Precio_Paquete: 2800000, Descripcion_Paquete: 'La opción preferida para bodas y quinceaños medianos.' },
        { Id_Paquete: 3, Nombre_Paquete: 'Paquete Charlie', Precio_Paquete: 4200000, Descripcion_Paquete: 'Cobertura completa premium para grandes celebraciones.' },
        { Id_Paquete: 4, Nombre_Paquete: 'Paquete Delta', Precio_Paquete: 1800000, Descripcion_Paquete: 'Especializado en graduaciones y eventos escolares.' },
        { Id_Paquete: 5, Nombre_Paquete: 'Paquete Foxtrot', Precio_Paquete: 3500000, Descripcion_Paquete: 'Producción de video cinematográfica y streaming.' }
      ]);
      console.log('✅ Paquetes creados');
    }

    // 5. Activar registros existentes y añadir stock por defecto
    await Categoria.update({ Activo: true }, { where: { Activo: null } });
    await Producto.update({ Activo: true }, { where: { Activo: null } });
    await Producto.update({ Stock: 100 }, { where: { Stock: 0 } });

    console.log('✨ Sembrado completado con éxito');
  } catch (error) {
    console.error('❌ Error en el sembrado:', error);
  }
};

module.exports = seedDatabase;
