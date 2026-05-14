const { NotificacionLogistica } = require('../models');
const restaurantesService = require('./restaurantes.service');

const EVENTO_POR_ESTADO = {
    pendiente: 'CREATED',
    asignada: 'ACCEPTED',
    en_ruta: 'PICKED_UP',
    entregada: 'DELIVERED',
    cancelada: 'CANCELLED',
    fallida: 'FAILED'
};

const notificarCambioEstado = async ({ entrega, estadoNuevo, repartidorId, comentario }) => {
    const evento = EVENTO_POR_ESTADO[estadoNuevo];
    if (!evento || entrega.tipo_origen !== 'pedido') return null;

    const destinoUrl = `/restaurantes/${entrega.empresa_id}/pedidos/${entrega.origen_id}/estado`;
    const payload = {
        entrega_id: entrega.id_entrega,
        estado_logistica: estadoNuevo,
        evento,
        repartidor_id: repartidorId || null,
        comentario: comentario || null,
        timestamp: new Date().toISOString()
    };

    const notificacion = await NotificacionLogistica.create({
        entrega_id: entrega.id_entrega,
        evento,
        destino_url: destinoUrl,
        payload,
        exitosa: false,
        intentos: 0
    });

    try {
        const response = await restaurantesService.notificarEstadoPedido({
            restauranteId: entrega.empresa_id,
            pedidoId: entrega.origen_id,
            evento,
            estadoLogistica: estadoNuevo,
            entregaId: entrega.id_entrega,
            repartidorId,
            comentario
        });

        await notificacion.update({
            exitosa: true,
            http_status: 200,
            respuesta: JSON.stringify(response),
            intentos: 1,
            ultimo_intento_at: new Date()
        });
    } catch (error) {
        await notificacion.update({
            exitosa: false,
            http_status: error.status || null,
            respuesta: error.data ? JSON.stringify(error.data) : error.message,
            intentos: 1,
            ultimo_intento_at: new Date()
        });
    }

    return notificacion;
};

module.exports = {
    notificarCambioEstado,
    EVENTO_POR_ESTADO
};
