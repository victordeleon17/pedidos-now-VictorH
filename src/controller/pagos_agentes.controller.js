const pagosService = require('../services/pagos_agentes.service');

const getAllPagosAgentes = async (req, res) => {
    try {
        const pagos = await pagosService.getAll();
        res.json(pagos);
    } catch (error) {
        console.error("ERROR REAL:", error);
        res.status(500).json({ error: 'Error interno'});
    }
};

const getTotalPagos = async (req, res) => {
    try {
        const total = await pagosService.obtenerTotalPagos();
        res.json(total);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error al obtener total de pagos'});
    }
};

module.exports = {
    getAllPagosAgentes,
    getTotalPagos
};