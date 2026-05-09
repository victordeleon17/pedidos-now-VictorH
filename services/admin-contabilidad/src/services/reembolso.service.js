const db = require('../config/db')
const repo = require('../repositories/reembolso.repository');
const movRepo = require('../repositories/movimiento.repository');
const bancarioService = require('./sistema-bancario.service');

const registrarReembolso = async (data) => {
    const conn = await db.getConnection();

    const transferencia = await bancarioService.transferencia({
        cuenta_origen: 1, // Cuenta de reembolsos
        cuenta_destino: data.cliente_cuenta_bancaria,
        monto: data.monto,
        concepto: 'Reembolso por cancelación'
    });
    
    const reembolsoId = await repo.crearReembolso(data);
    
    return {
        reembolso_id: reembolsoId,
        transferencia_id: transferencia.id
    };

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
        const reembolsoId = await repo.crearReembolsoConn(conn, data);

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