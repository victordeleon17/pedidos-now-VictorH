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

const crearPagoAgente = async (req, res) => {
    try {
        const data = req.body;

        if(!data.agente_id || !data.salario || data.salario <= 0) {
            return res.status(400).json({
                error: 'Datos inválidos'
            });
        }
        const result = await pagosService.pagarAgente(data);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:'Error al pagar agente'});
    }
};

module.exports = {
    getAllPagosAgentes,
    getTotalPagos,
    crearPagoAgente
};