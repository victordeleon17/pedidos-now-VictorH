const db = require('../config/db')
const repo = require('../repositories/reembolso.repository');
const movRepo = require('../repositories/movimiento.repository');

const registrarReembolso = async (data) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const cuenta_id = 2;

        const [rows] = await conn.query(
            'SELECT saldo FROM cuenta_fondo WHERE id = ? FOR UPDATE',
            [cuenta_id]
        );

        if (rows.length === 0) {
            throw new Error('Cuenta no existe');
        }

        if (rows[0].saldo < data.monto) {
            throw new Error('Fondos insuficientes');
        }

        //guarda reembolso
        const reembolsoId = await repo.crearReembolso(conn, data);

        //registrar egreso financiero
        const movimientoId = await movRepo.crearEgresoConn(conn, {
            cuenta_id,
            subtipo: 'reembolso',
            referencia_id: data.pedido_id,
            monto: data.monto,
            descripcion: data.motivo
        });

        await conn.query(
            'UPDATE cuenta_fondo SET saldo = saldo - ? WHERE id = ?',
            [data.monto, cuenta_id]
        );

        await conn.commit();

        return {
            ok: true,
            reembolso_id: reembolsoId,
            movimiento_id: movimientoId
        };
    } catch(error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

module.exports = {
    registrarReembolso
}