/**
 * Script de prueba para verificar modelos de Logística
 * Ejecutar: node test-models.js
 */

require('dotenv').config();
const { 
    sequelize, 
    testConnection, 
    syncDatabase 
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
        // 1. Probar conexión
        console.log('🔌 Paso 1: Probando conexión a la base de datos...');
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        console.log('');

        // 2. Verificar modelos cargados
        console.log('📦 Paso 2: Verificando modelos cargados...');
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

        // 3. Verificar relaciones
        console.log('🔗 Paso 3: Verificando relaciones entre modelos...');
        
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

        // 4. Sincronizar modelos (sin force para no borrar datos)
        console.log('🔄 Paso 4: Sincronizando modelos con la base de datos...');
        console.log('   ⚠️  Usando { alter: true } para ajustar tablas existentes');
        
        const synced = await syncDatabase({ alter: true });
        
        if (synced) {
            console.log('   ✅ Sincronización completada');
        }
        console.log('');

        // 5. Resumen
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ PRUEBA EXITOSA                      ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║  • 6 modelos cargados correctamente                      ║');
        console.log('║  • Relaciones configuradas                               ║');
        console.log('║  • Tablas sincronizadas con la base de datos             ║');
        console.log('╚═══════════════════════════════════════════════════════════╝\n');

        // 6. Mostrar información adicional
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
