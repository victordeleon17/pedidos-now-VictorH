const repo = require('../repositories/compensacion.repository');
const movRepo = require('../repositories/movimiento.repository');
const auditoriaRepo = require('../repositories/auditoria.repository');

const registrarCompensacion = async (data) => {
    const cuenta_id = 1;

    //guarda compensación
    const compensacionId = await repo.crearCompensacion(data);

    //registrar egreso financiero
    const movimientoId = await movRepo.crearEgreso({
        cuenta_id,
        subtipo: 'compensacion',
        referencia_id: data.entidad_id,
        monto: data.monto,
        descripcion: data.motivo
    });

    //restar saldo
    await movRepo.restarSaldo(cuenta_id, data.monto);

    //auditoria
    await auditoriaRepo.registrarLog({
        accion: 'COMPENSACION',
        descripcion: `Compensación a entidad ${data.entidad_id}`,
        monto: data.monto
    });

    return {
        ok: true,
        compensacion_id: compensacionId,
        movimiento_id: movimientoId
    };
};

module.exports = {
    registrarCompensacion
};