const path = require('path');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { sequelize } = require('./config/db');


const testRoutes = require('./routes/test.routes');
const pagosAgentesRoutes = require('./routes/pagos_agentes.routes');
const reportesRoutes = require('./routes/reportes.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const movimientoRoutes = require('./routes/movimiento.routes');
const reembolsoRoutes = require('./routes/reembolso.routes');
const compensacionRoutes = require('./routes/compensacion.routes');
const bancosRoutes = require('./routes/bancos.routes');

// Admin-contabilidad Emmanuel
const reportesRestaurantesRoutes = require('./routes/reportesRestaurantes.routes');

const initDB = require('./database/init');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.BROKER_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== RUTAS PÚBLICAS ==========
app.use('/api/auth', require('./routes/auth.routes'));

// ========== RUTAS PROTEGIDAS ==========
app.use('/api/payments', require('./routes/cobros.routes'));
app.use('/api/bancos', bancosRoutes);
app.use('/api/compensaciones', require('./routes/compensacion.routes'));
app.use('/api/pagos-agentes', require('./routes/pagos_agentes.routes'));
app.use('/api/reembolsos', require('./routes/reembolso.routes'));
app.use('/api/movimientos', require('./routes/movimiento.routes'));
app.use('/api/reportes', require('./routes/reportes.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Admin-contabilidad Emmanuel
app.use('/api/reportes-restaurantes', reportesRestaurantesRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Microservicio Admin/Contabilidad OK' });
});

app.get('/test-directo', (req, res) => {
  res.send('funciona');
});

app.get('/debug', (req, res) => {
  res.send('OK');
});

// Middleware de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        ok: false,
        error: err.message,
        timestamp: new Date().toISOString()
    });
});

// Inicio del servidor
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Probar conexión a base de datos
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente.');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Modelos sincronizados con la base de datos.');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error.message);
    process.exit(1);
  }
};

app.get('/api/health', (req, res) => {
    res.json({
        estado: 'OK',
        servicio: 'admin-contabilidad',
        puerto: 3000,
        timestamp: new Date().toISOString()
    });
});

startServer();

module.exports = app;