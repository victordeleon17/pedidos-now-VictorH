const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize(
    process.env.DB_NAME || 'modulo_logistica_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true
        }
    }
);

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ [LOGÍSTICA] Conexión a la base de datos establecida correctamente.');
        return true;
    } catch (error) {
        console.error('❌ [LOGÍSTICA] Error al conectar con la base de datos:', error.message);
        return false;
    }
};

// Función para sincronizar modelos (solo en desarrollo)
const syncDatabase = async (options = {}) => {
    try {
        await sequelize.sync(options);
        console.log('✅ [LOGÍSTICA] Modelos sincronizados con la base de datos.');
        return true;
    } catch (error) {
        console.error('❌ [LOGÍSTICA] Error al sincronizar modelos:', error.message);
        return false;
    }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.syncDatabase = syncDatabase;
