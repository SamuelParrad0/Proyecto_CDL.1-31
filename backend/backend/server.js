const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const { initAssociations } = require('./models');
const { normalizarBody } = require('./middleware/normalizarBody');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalizar body — acepta tanto camelCase como PascalCase
app.use(normalizarBody);

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const citasRoutes = require('./routes/citas.routes');
app.use('/api/citas', citasRoutes);

const personalizadoRoutes = require('./routes/personalizado.routes');
app.use('/api/personalizado', personalizadoRoutes);

const carritoRoutes = require('./routes/carrito.routes');
app.use('/api/carrito', carritoRoutes);

const categoriasRoutes = require('./routes/categorias.routes');
app.use('/api/categorias', categoriasRoutes);

const productosRoutes = require('./routes/productos.routes');
app.use('/api/productos', productosRoutes);

const direccionRoutes = require('./routes/direccion.routes');
app.use('/api/direcciones', direccionRoutes);

const paquetesRoutes = require('./routes/paquetes.routes');
app.use('/api/paquetes', paquetesRoutes);

const opinionesRoutes = require('./routes/opiniones.routes');
app.use('/api/opiniones', opinionesRoutes);

const pedidosRoutes = require('./routes/pedidos.routes');
app.use('/api/pedidos', pedidosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: '🚀 Backend E-commerce funcionando correctamente',
    ambiente: process.env.NODE_ENV
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.stack);
  res.status(err.status || 500).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
const seedDatabase = require('./utils/seeder');

const iniciarServidor = async () => {
  initAssociations();

  const conectado = await testConnection();
  if (!conectado) {
    console.error('❌ No se pudo conectar a MySQL. Verifica XAMPP.');
    process.exit(1);
  }

  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

iniciarServidor();