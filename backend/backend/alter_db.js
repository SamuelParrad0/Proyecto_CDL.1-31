require('dotenv').config();
const { sequelize } = require('./config/database');

async function alterTable() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la BD.');
    await sequelize.query('ALTER TABLE reseñas ADD COLUMN Activo BOOLEAN DEFAULT 1;');
    console.log('Columna Activo agregada a reseñas.');
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('La columna Activo ya existe.');
    } else {
      console.error('Error alterando la tabla:', error);
    }
  } finally {
    await sequelize.close();
  }
}

alterTable();
