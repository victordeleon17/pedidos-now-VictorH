require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function run() {
    const pool = mysql.createPool({
        host:     process.env.DB_HOST     || 'localhost',
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'db_admin_contabilidad',
        port:     process.env.DB_PORT     || 3306,
        multipleStatements: true,
    });

    const conn = await pool.getConnection();

    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                nombre       VARCHAR(255) NOT NULL UNIQUE,
                ejecutada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [ejecutadas] = await conn.query('SELECT nombre FROM migrations');
        const yaEjecutadas = new Set(ejecutadas.map(r => r.nombre));

        const archivos = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.sql'))
            .sort();

        const pendientes = archivos.filter(f => !yaEjecutadas.has(f));

        if (pendientes.length === 0) {
            console.log('✅ Sin migraciones pendientes.');
            return;
        }

        console.log(`📦 ${pendientes.length} migración(es) pendiente(s):\n`);

        for (const archivo of pendientes) {
            const rutaCompleta = path.join(MIGRATIONS_DIR, archivo);
            const sql = fs.readFileSync(rutaCompleta, 'utf8');

            process.stdout.write(`  ➜ ${archivo} ... `);

            await conn.beginTransaction();
            try {
                await conn.query(sql);
                await conn.query('INSERT INTO migrations (nombre) VALUES (?)', [archivo]);
                await conn.commit();
                console.log('OK');
            } catch (err) {
                await conn.rollback();
                console.log('ERROR');
                console.error(`\n❌ Falló: ${archivo}`);
                console.error(`   ${err.message}\n`);
                process.exit(1);
            }
        }

        console.log('\n✅ Migraciones aplicadas correctamente.');
    } finally {
        conn.release();
        await pool.end();
    }
}

run().catch(err => {
    console.error('Error inesperado en el runner de migraciones:', err.message);
    process.exit(1);
});
