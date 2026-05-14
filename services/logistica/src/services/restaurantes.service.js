const env = require('../config/env');
const { requestJson } = require('./http.service');
const pedidoMock = require('../data/restaurante-pedido.mock');

const buildUrl = (path) => `${env.RESTAURANTES_API_URL.replace(/\/$/, '')}${path}`;

const obtenerRestaurante = async (restauranteId) => {
    const response = await requestJson(buildUrl(`/restaurantes/${restauranteId}`));
    return response.data || response;
};

const obtenerPedido = async (restauranteId, pedidoId) => {
    const response = await requestJson(buildUrl(`/restaurantes/${restauranteId}/pedidos/${pedidoId}`));
    return response.data || response;
};

const obtenerPedidoLogistica = async (restauranteId, pedidoId) => {
    const response = await requestJson(buildUrl(`/restaurantes/${restauranteId}/pedidos/${pedidoId}/logistica`));
    return response.data || response;
};

const obtenerPayloadLogistico = async (restauranteId, pedidoId, overrides = {}) => {
    try {
        const payload = await obtenerPedidoLogistica(restauranteId, pedidoId);

        return {
            tipo_origen: payload.tipo_origen || 'pedido',
            origen_id: payload.orden_id || pedidoId,
            empresa_id: payload.empresa_id || restauranteId,
            sucursal_id: payload.sucursal_id || overrides.sucursal_id || null,
            cliente_id: payload.cliente_id || overrides.cliente_id || pedidoMock.cliente_id,
            categoria_codigo: payload.categoria_codigo || 'FOOD',
            metodo_pago: payload.metodo_pago || overrides.metodo_pago || pedidoMock.metodo_pago,
            tarifa_ofrecida: payload.tarifa_ofrecida || overrides.tarifa_ofrecida || pedidoMock.tarifa_ofrecida,
            monto_cobrar: payload.monto_cobrar || overrides.monto_cobrar || pedidoMock.monto_cobrar,
            distancia_estimada_km: payload.distancia_estimada_km || overrides.distancia_estimada_km || pedidoMock.distancia_estimada_km,
            negocio_nombre: payload.negocio_nombre,
            negocio_telefono: payload.negocio_telefono,
            negocio_direccion: payload.negocio_direccion,
            origen_lat: payload.origen_coordenadas?.lat || overrides.origen_lat || 14.8355000,
            origen_lng: payload.origen_coordenadas?.lng || overrides.origen_lng || -91.5275000,
            cliente_nombre: payload.cliente_nombre || overrides.cliente_nombre || pedidoMock.cliente_nombre,
            cliente_telefono: payload.cliente_telefono || overrides.cliente_telefono || pedidoMock.cliente_telefono,
            direccion_entrega: payload.direccion_entrega || overrides.direccion_entrega || pedidoMock.direccion_entrega,
            referencia_direccion: payload.referencia_direccion || overrides.referencia_direccion || pedidoMock.referencia_direccion,
            instrucciones_entrega: payload.instrucciones_entrega || overrides.instrucciones_entrega || pedidoMock.instrucciones_entrega,
            destino_lat: payload.destino_coordenadas?.lat || overrides.destino_lat || pedidoMock.destino_lat,
            destino_lng: payload.destino_coordenadas?.lng || overrides.destino_lng || pedidoMock.destino_lng,
            detalles_orden: payload.detalles_orden || overrides.detalles_orden || pedidoMock.detalles_orden,
            fecha_entrega_estimada: payload.fecha_entrega_estimada || overrides.fecha_entrega_estimada || pedidoMock.fecha_entrega_estimada,
            metadata_integracion: {
                fuente: 'restaurantes-logistica',
                restaurante_url: env.RESTAURANTES_API_URL,
                pedido_fallback: false
            }
        };
    } catch (error) {
        // Si el endpoint dedicado no esta disponible, se usa el contrato anterior con fallback.
    }

    const restaurante = await obtenerRestaurante(restauranteId);
    let pedido = null;
    let pedidoFallback = false;

    try {
        pedido = await obtenerPedido(restauranteId, pedidoId);
    } catch (error) {
        pedidoFallback = true;
        pedido = { id: pedidoId, ...pedidoMock, ...overrides };
    }

    return {
        tipo_origen: 'pedido',
        origen_id: pedido.id || pedidoId,
        empresa_id: restaurante.id || restauranteId,
        sucursal_id: overrides.sucursal_id || null,
        cliente_id: pedido.cliente_id || overrides.cliente_id || pedidoMock.cliente_id,
        categoria_codigo: 'FOOD',
        metodo_pago: pedido.metodo_pago || overrides.metodo_pago || pedidoMock.metodo_pago,
        tarifa_ofrecida: pedido.tarifa_ofrecida || overrides.tarifa_ofrecida || pedidoMock.tarifa_ofrecida,
        monto_cobrar: pedido.total || pedido.monto_cobrar || overrides.monto_cobrar || pedidoMock.monto_cobrar,
        distancia_estimada_km: pedido.distancia_estimada_km || overrides.distancia_estimada_km || pedidoMock.distancia_estimada_km,
        negocio_nombre: restaurante.nombre,
        negocio_telefono: restaurante.telefono,
        negocio_direccion: restaurante.direccion,
        origen_lat: overrides.origen_lat || 14.8355000,
        origen_lng: overrides.origen_lng || -91.5275000,
        cliente_nombre: pedido.cliente_nombre || overrides.cliente_nombre || pedidoMock.cliente_nombre,
        cliente_telefono: pedido.cliente_telefono || overrides.cliente_telefono || pedidoMock.cliente_telefono,
        direccion_entrega: pedido.direccion_entrega || overrides.direccion_entrega || pedidoMock.direccion_entrega,
        referencia_direccion: pedido.referencia_direccion || overrides.referencia_direccion || pedido.notas || pedidoMock.referencia_direccion,
        instrucciones_entrega: pedido.instrucciones_entrega || overrides.instrucciones_entrega || pedido.notas || pedidoMock.instrucciones_entrega,
        destino_lat: pedido.destino_lat || overrides.destino_lat || pedidoMock.destino_lat,
        destino_lng: pedido.destino_lng || overrides.destino_lng || pedidoMock.destino_lng,
        detalles_orden: pedido.detalles_orden || pedido.items || overrides.detalles_orden || pedidoMock.detalles_orden,
        fecha_entrega_estimada: pedido.fecha_entrega_estimada || overrides.fecha_entrega_estimada || pedidoMock.fecha_entrega_estimada,
        metadata_integracion: {
            fuente: 'restaurantes',
            restaurante_url: env.RESTAURANTES_API_URL,
            pedido_fallback: pedidoFallback
        }
    };
};

const ESTADO_RESTAURANTE_POR_EVENTO = {
    ACCEPTED: 4,
    PICKED_UP: 5,
    DELIVERED: 6,
    CANCELLED: 7,
    FAILED: 7
};

const notificarEstadoPedido = async ({ restauranteId, pedidoId, evento, estadoLogistica, entregaId, repartidorId, comentario }) => {
    return requestJson(buildUrl(`/restaurantes/${restauranteId}/pedidos/${pedidoId}/estado`), {
        method: 'PUT',
        body: {
            estado_id: ESTADO_RESTAURANTE_POR_EVENTO[evento] || 2,
            motivo: evento,
            metadata: {
                entrega_id: entregaId,
                estado_logistica: estadoLogistica,
                repartidor_id: repartidorId || null,
                comentario: comentario || null,
                timestamp: new Date().toISOString()
            }
        }
    });
};

module.exports = {
    obtenerRestaurante,
    obtenerPedido,
    obtenerPedidoLogistica,
    obtenerPayloadLogistico,
    notificarEstadoPedido
};
