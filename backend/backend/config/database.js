const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '-05:00',
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    console.error('📋 Verifica que XAMPP esté corriendo y las credenciales en .env sean correctas');
    return false;
  }
};

const syncDatabase = async (force = false, alter = false) => {
  try {
    await sequelize.sync({ force, alter });
    if (force) {
      console.log('🔄 Base de datos sincronizada (todas las tablas recreadas).');
    } else if (alter) {
      console.log('🔄 Base de datos sincronizada (tablas alteradas según modelos).');
    } else {
      console.log('✅ Base de datos sincronizada correctamente.');
    }
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection, syncDatabase };