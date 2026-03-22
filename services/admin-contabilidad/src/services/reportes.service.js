const reportesRepo = require('../repositories/reportes.repository');

const getPagosPorFecha = (inicio, fin) => {
    return reportesRepo.getPagosPorFecha(inicio, fin);
};

const getVentas = (inicio, fin) => {
    return reportesRepo.getVentas(inicio, fin);
};

const getPedidos = (inicio, fin) => {
    return reportesRepo.getPedidos(inicio, fin);
}

const getPropinas = (inicio, fin) => {
    return reportesRepo.getPropinas(inicio, fin);
};

const getCostos = (inicio, fin) => {
    return reportesRepo.getCostos(inicio, fin);
};

const getCrecimiento = async() => {
    const data = await reportesRepo.getCrecimientoVentas();

    const hoy = Number(data.hoy);
    const ayer = Number(data.ayer);

    const crecimiento = data.ayer === 0
        ? 100
        : ((hoy - ayer) / ayer) * 100;
    
    return {
        hoy,
        ayer,
        crecimiento
    };
};

const getChats = async () => {
    return await reportesRepo.getChats();
}

const getUsuarios = async () => {
    return await reportesRepo.getUsuariosMes();
}

const axios = require('axios');

const getPedidosExternos = async () => {
    try {
        const response = await axios.get('http://localhost:4000/pedidos');
        return response.data;
    } catch (error) {
        return {
            mensaje: 'Servicio externo no disponible',
            fallback: true
        };
    }
};

module.exports = {
    getPagosPorFecha,
    getVentas,
    getPedidos,
    getPropinas,
    getCostos,
    getCrecimiento,
    getChats,
    getUsuarios,
    getPedidosExternos
};