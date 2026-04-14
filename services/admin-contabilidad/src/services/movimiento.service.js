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

// Admin-contabilidad Kenneth

const registrarEgresoEnvio = async ({ pedido_id, repartidor_id, costo_envio }) => {
  return await repo.crearMovimiento({
    tipo: 'egreso',
    subtipo: 'envio',
    modulo_origen: 'paqueteria',
    monto: costo_envio,
    descripcion: 'Pago a repartidor',
    pedido_id,
    repartidor_id,
    estado: 'completado'
  });
};

const registrarIngresoEnvio = async ({ pedido_id, monto }) => {
  return await repo.crearMovimiento({
    tipo: 'ingreso',
    subtipo: 'envio',
    modulo_origen: 'paqueteria',
    monto,
    descripcion: 'Cobro por envío',
    pedido_id,
    estado: 'pendiente'
  });
};


const obtenerFondos = async () => {
    return await repo.getFondos();
};

// Admin-contabilidad Kenneth

module.exports = {
    registrarIngresoPedido,
    registrarEgreso,
    registrarEgresoEnvio,
    registrarIngresoEnvio,
    obtenerFondos
};

