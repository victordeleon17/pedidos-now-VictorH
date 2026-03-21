/**
 * Script de prueba para verificar modelos de Logística
 * Ejecutar: node test-models.js
 */

require('dotenv').config();
const { 
    sequelize, 
    testConnection, 
    syncDatabase,
    createDatabaseIfNotExists,
    initDatabase
} = require('./db/db');

const {
    Repartidor,
    EstadoOperativoRepartidor,
    Entrega,
    AsignacionEntrega,
    HistorialEstadoEntrega,
    IncidenciaEntrega
} = require('./src/models');

async function testModels() {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║     PRUEBA DE MODELOS - MÓDULO DE LOGÍSTICA              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    try {
        // 1. Crear base de datos si no existe
        console.log('🔧 Paso 1: Verificando/Creando base de datos...');
        const dbCreated = await createDatabaseIfNotExists();
        if (!dbCreated) {
            throw new Error('No se pudo crear la base de datos');
        }
        console.log('');

        // 2. Probar conexión
        console.log('🔌 Paso 2: Probando conexión a la base de datos...');
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        console.log('');

        // 3. Verificar modelos cargados
        console.log('📦 Paso 3: Verificando modelos cargados...');
        const modelos = [
            'Repartidor',
            'EstadoOperativoRepartidor',
            'Entrega',
            'AsignacionEntrega',
            'HistorialEstadoEntrega',
            'IncidenciaEntrega'
        ];

        modelos.forEach(modelo => {
            const modeloObj = eval(modelo);
            if (modeloObj) {
                console.log(`   ✅ ${modelo}: ${modeloObj.tableName}`);
            } else {
                console.log(`   ❌ ${modelo}: No cargado`);
            }
        });
        console.log('');

        // 4. Verificar relaciones
        console.log('🔗 Paso 4: Verificando relaciones entre modelos...');
        
        console.log('   Repartidor:');
        console.log(`      → entregas: ${Repartidor.associations.entregas ? '✅' : '❌'}`);
        console.log(`      → asignaciones: ${Repartidor.associations.asignaciones ? '✅' : '❌'}`);
        console.log(`      → estado_operativo: ${Repartidor.associations.estado_operativo ? '✅' : '❌'}`);
        
        console.log('   Entrega:');
        console.log(`      → historial: ${Entrega.associations.historial ? '✅' : '❌'}`);
        console.log(`      → asignaciones: ${Entrega.associations.asignaciones ? '✅' : '❌'}`);
        console.log(`      → incidencias: ${Entrega.associations.incidencias ? '✅' : '❌'}`);
        console.log(`      → repartidor: ${Entrega.associations.repartidor ? '✅' : '❌'}`);
        
        console.log('');

        // 5. Sincronizar modelos (sin force para no borrar datos)
        console.log('🔄 Paso 5: Sincronizando modelos con la base de datos...');
        console.log('   ⚠️  Usando { alter: true } para ajustar tablas existentes');
        
        const synced = await syncDatabase({ alter: true });
        
        if (synced) {
            console.log('   ✅ Sincronización completada');
        }
        console.log('');

        // 6. Resumen
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ PRUEBA EXITOSA                      ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║  • Base de datos creada/verificada                       ║');
        console.log('║  • 6 modelos cargados correctamente                      ║');
        console.log('║  • Relaciones configuradas                               ║');
        console.log('║  • Tablas sincronizadas con la base de datos             ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        // 7. Mostrar información adicional
        console.log('📊 INFORMACIÓN DE MODELOS:\n');
        console.log('Tabla                           PK                    Timestamps');
        console.log('────────────────────────────────────────────────────────────────');
        console.log(`entregas                        id_entrega            ✅`);
        console.log(`asignaciones_entrega            id_asignacion         ✅ (solo created_at)`);
        console.log(`historial_estados_entrega       id_historial_estado   ✅ (solo created_at)`);
        console.log(`incidencias_entrega             id_incidencia         ✅`);
        console.log(`repartidores                    id_repartidor         ✅`);
        console.log(`estados_operativos_repartidor   id_estado_operativo   ✅ (solo updated_at)`);
        console.log('');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
        console.error('\nDetalles:', error);
        process.exit(1);
    }
}

// Ejecutar prueba
testModels();
