const { sequelize } = require('../config/database');
const Categoria = require('../models/Categoria');

async function listCategories() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');
    
    const categorias = await Categoria.findAll();
    console.log('\n--- CATEGORÍAS ACTUALES ---');
    categorias.forEach(cat => {
      console.log(`ID: ${cat.Id_Categoria} | Nombre: ${cat.Nombre_Categoria} | Activa: ${cat.Activa}`);
    });
    console.log('---------------------------\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

listCategories();
