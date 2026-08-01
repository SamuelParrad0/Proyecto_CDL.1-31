const { sequelize } = require('../config/database');
const Categoria = require('../models/Categoria');

async function checkDetails() {
  try {
    await sequelize.authenticate();
    const categorias = await Categoria.findAll();
    categorias.forEach(cat => {
      console.log(`\nID: ${cat.Id_Categoria} | Nombre: ${cat.Nombre_Categoria}`);
      console.log(`Descripción: ${cat.Descripcion_Categoria}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDetails();
