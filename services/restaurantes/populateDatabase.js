const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Configuración para conectar a la base de datos en producción
const DATABASE_URL = process.env.DATABASE_URL || 'https://restaurantes.fly.dev/api';

// Si se proporciona DATABASE_URL como URL del servicio, convertir a conexión DB
let sequelizeConfig;

if (process.env.DB_URL) {
  // Conexión directa con URL de base de datos
  sequelizeConfig = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Configuración manual para producción
  sequelizeConfig = new Sequelize(
    process.env.DB_NAME || 'restaurantes_db',
    process.env.DB_USER || 'postgres', 
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

async function runSeeders() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelizeConfig.authenticate();
    console.log('✅ Conexión establecida exitosamente');

    // Obtener todos los archivos de seeders
    const seedersPath = path.join(__dirname, 'seeders');
    const seederFiles = fs.readdirSync(seedersPath)
      .filter(file => file.endsWith('.js'))
      .sort(); // Ejecutar en orden alfabético

    console.log('📁 Seeders encontrados:', seederFiles);

    // Ejecutar cada seeder
    for (const file of seederFiles) {
      try {
        console.log(`\n🌱 Ejecutando seeder: ${file}`);
        const seederPath = path.join(seedersPath, file);
        const seeder = require(seederPath);
        
        // Ejecutar el método 'up' del seeder
        await seeder.up(sequelizeConfig.getQueryInterface(), Sequelize);
        console.log(`✅ Seeder ${file} ejecutado exitosamente`);
        
      } catch (error) {
        console.error(`❌ Error ejecutando seeder ${file}:`, error.message);
        // Continuar con el siguiente seeder en caso de error
        continue;
      }
    }

    console.log('\n🎉 ¡Todos los seeders ejecutados!');
    console.log('📊 Base de datos poblada con datos de prueba');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await sequelizeConfig.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Función para verificar el estado de la base de datos
async function checkDatabase() {
  try {
    console.log('🔍 Verificando estado de la base de datos...');
    
    // Consultar algunas tablas para ver si tienen datos
    const [restaurantes] = await sequelizeConfig.query('SELECT COUNT(*) as count FROM "Restaurantes"');
    const [productos] = await sequelizeConfig.query('SELECT COUNT(*) as count FROM "Productos"');
    const [horarios] = await sequelizeConfig.query('SELECT COUNT(*) as count FROM "Horarios"');
    
    console.log('\n📊 Estado actual de la base de datos:');
    console.log(`   Restaurantes: ${restaurantes[0].count} registros`);
    console.log(`   Productos: ${productos[0].count} registros`);
    console.log(`   Horarios: ${horarios[0].count} registros`);
    
    return {
      restaurantes: parseInt(restaurantes[0].count),
      productos: parseInt(productos[0].count),
      horarios: parseInt(horarios[0].count)
    };
    
  } catch (error) {
    console.log('⚠️  No se pudo verificar el estado (las tablas podrían no existir aún)');
    return null;
  }
}

// Función para limpiar datos existentes
async function cleanDatabase() {
  try {
    console.log('🧹 Limpiando datos existentes...');
    
    // Limpiar en orden inverso por las relaciones FK
    await sequelizeConfig.query('DELETE FROM "Productos"');
    await sequelizeConfig.query('DELETE FROM "Horarios"');
    await sequelizeConfig.query('DELETE FROM "EstadosPedido"');
    await sequelizeConfig.query('DELETE FROM "TiposCombos"');
    await sequelizeConfig.query('DELETE FROM "TiposProducto"');
    await sequelizeConfig.query('DELETE FROM "Restaurantes"');
    
    console.log('✅ Datos limpiados exitosamente');
    
  } catch (error) {
    console.error('❌ Error limpiando datos:', error.message);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'check':
      await checkDatabase();
      await sequelizeConfig.close();
      break;
      
    case 'clean':
      await cleanDatabase();
      await sequelizeConfig.close();
      break;
      
    case 'seed':
      await runSeeders();
      break;
      
    case 'reset':
      await cleanDatabase();
      await runSeeders();
      break;
      
    default:
      console.log('\n📋 Uso: node populateDatabase.js <comando>');
      console.log('\n📌 Comandos disponibles:');
      console.log('   check  - Verificar estado actual de la base de datos');
      console.log('   clean  - Limpiar todos los datos');
      console.log('   seed   - Ejecutar todos los seeders');
      console.log('   reset  - Limpiar y poblar la base de datos');
      console.log('\n🌍 Variables de entorno requeridas:');
      console.log('   DB_URL     - URL completa de conexión PostgreSQL');
      console.log('   O configurar individualmente:');
      console.log('   DB_HOST    - Host de la base de datos');
      console.log('   DB_PORT    - Puerto (default: 5432)');
      console.log('   DB_NAME    - Nombre de la base de datos');
      console.log('   DB_USER    - Usuario de la base de datos');
      console.log('   DB_PASSWORD - Contraseña de la base de datos');
      console.log('\n💡 Ejemplo:');
      console.log('   DB_URL="postgresql://user:pass@host:5432/dbname" node populateDatabase.js reset');
      await sequelizeConfig.close();
      break;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  runSeeders,
  checkDatabase,
  cleanDatabase,
  sequelizeConfig
};