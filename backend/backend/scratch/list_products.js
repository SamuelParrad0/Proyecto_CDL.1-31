const { sequelize } = require('../config/database');
const Producto = require('../models/Producto');

async function listProducts() {
  try {
    await sequelize.authenticate();
    const productos = await Producto.findAll();
    console.log('\n--- PRODUCTOS ACTUALES ---');
    productos.forEach(p => {
      console.log(`ID: ${p.Id_Producto} | Nombre: ${p.Nombre_Producto} | CatID: ${p.Id_Categoria}`);
    });
    console.log('---------------------------\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

listProducts();
