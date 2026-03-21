const { Sequelize } = require('sequelize');

// Nombre de la base de datos
const DB_NAME = process.env.DB_NAME || 'modulo_logistica_db';

// Conexión sin especificar base de datos (para crearla si no existe)
const sequelizeWithoutDB = new Sequelize(
    '',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
    }
);

// Configuración de la base de datos principal
const sequelize = new Sequelize(
    DB_NAME,
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

// Función para crear la base de datos si no existe
const createDatabaseIfNotExists = async () => {
    try {
        await sequelizeWithoutDB.authenticate();
        
        // Crear la base de datos si no existe
        await sequelizeWithoutDB.query(
            `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` 
             CHARACTER SET utf8mb4 
             COLLATE utf8mb4_unicode_ci;`
        );
        
        console.log(`✅ [LOGÍSTICA] Base de datos '${DB_NAME}' verificada/creada correctamente.`);
        await sequelizeWithoutDB.close();
        return true;
    } catch (error) {
        console.error('❌ [LOGÍSTICA] Error al crear la base de datos:', error.message);
        return false;
    }
};

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

// Función para inicializar la base de datos completa
const initDatabase = async (options = {}) => {
    try {
        console.log('\n🔧 [LOGÍSTICA] Iniciando configuración de base de datos...\n');
        
        // 1. Crear base de datos si no existe
        await createDatabaseIfNotExists();
        
        // 2. Probar conexión
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        // 3. Sincronizar modelos
        console.log('\n🔄 [LOGÍSTICA] Sincronizando modelos...');
        await syncDatabase(options);
        
        console.log('\n✅ [LOGÍSTICA] Base de datos inicializada correctamente.\n');
        return true;
    } catch (error) {
        console.error('\n❌ [LOGÍSTICA] Error al inicializar base de datos:', error.message);
        return false;
    }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.syncDatabase = syncDatabase;
module.exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
module.exports.initDatabase = initDatabase;
