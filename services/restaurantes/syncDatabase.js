const { sequelize, testConnection } = require('./src/config/database');
// Importar todos los modelos para que Sequelize los registre
require('./src/models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Iniciando sincronización de base de datos...');
    
    // Probar conexión
    await testConnection();
    
    // Sincronizar con force: true (elimina y recrea las tablas)
    // ADVERTENCIA: Esto eliminará todos los datos existentes
    await sequelize.sync({ force: true });
    
    console.log('✅ Base de datos sincronizada exitosamente.');
    console.log('⚠️  Todas las tablas han sido recreadas.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
};

syncDatabase();
