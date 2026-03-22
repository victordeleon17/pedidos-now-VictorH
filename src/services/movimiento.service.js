const repo = require('../repositories/movimiento.repository');

const registrarIngresoPedido = async (data) => {
    const cuenta_id = 1; //fondo principal

    const movimientoId = await repo.crearMovimiento({
        cuenta_id, 
        referencia_id: data.pedido_id,
        monto: data.monto,
        descripcion: data.descripcion
    });

    await repo.actualizarSaldo(cuenta_id, data.monto);

    return {
        ok: true,
        movimiento_id: movimientoId
    };
};

const registrarEgreso = async (data) => {
    const cuenta_id = 1;

    const movimientoId = await repo.crearEgreso({
        cuenta_id,
        subtipo: data.tipo, //salario, reembolso, compensación
        referencia_id: data.empleado_id,
        monto: data.monto,
        descripcion: data.descripcion
    });
    await repo.restarSaldo(cuenta_id, data.monto);

    return {
        ok: true,
        movimiento_id: movimientoId
    };
};

module.exports = {
    registrarIngresoPedido,
    registrarEgreso
}