const service = require('../services/reembolso.service');

const crearReembolso = async (req, res) => {
    try {
        const data = req.body;

        const result = await service.registrarReembolso(data);

        res.json(result);
    } catch(error) {
        console.error("Error Reembolso", error);       
        res.status(500).json({error:'Error al procesar reembolso'});
    }
};

module.exports = {
    crearReembolso
}