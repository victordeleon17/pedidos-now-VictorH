const repository = require('../repositories/pagos_agentes.repository');
const movRepo = require('../repositories/movimiento.repository')

const getAll = async () => {
    return await repository.getAll();
};

const obtenerTotalPagos = async () => {
    return await repository.getTotalPagosAgentes();
}

const pagarAgente = async (data) => {
    const cuenta_id = 1;

    //registrar pago
    const pagoId = await repository.crearPagoAgente(data);

    //registrar egreso financiero
    const movimientoId = await movRepo.crearEgreso({
        cuenta_id,
        subtipo: 'salario',
        referencia_id: data.agente_id,
        monto: data.salario,
        descripcion: 'Pago de salario'
    });
    await movRepo.restarSaldo(cuenta_id, data.salario);
    return {
        ok: true,
        pago_id: pagoId,
        movimiento_id: movimientoId
    };
};

module.exports = {
    getAll, 
    obtenerTotalPagos,
    pagarAgente
}