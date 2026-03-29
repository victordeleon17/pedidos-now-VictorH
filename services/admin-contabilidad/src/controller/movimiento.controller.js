const service = require('../services/movimiento.service');

const ingresoPedido = async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.pedido_id || !data.monto || data.monto <= 0) {
            return res.status(400).json({
                error: 'Faltan datos o monto inválido'
            });
        }

        const result = await service.registrarIngresoPedido(data);

        res.json(result);
    } catch (error) {
        console.error({
            mensaje: error.message,
            stack: error.stack
        });        
        res.status(500).json({error:'Error al registrar ingreso'});
    }
};

const egreso = async (req, res) => {
    try {
        const data = req.body;

        const result = await service.registrarEgreso(data);

        res.json(result);
    } catch (error) {
        console.error({
            mensaje: error.message,
            stack: error.stack
        });        
        res.status(500).json({error: 'Error al registrar egreso'});
    }
};

const getFondos = async (req, res) => {
    try {
        const fondos = await service.obtenerFondos();
        res.json(fondos);
    } catch (error) {
        console.error({
            mensaje: error.message,
            stack: error.stack
        });        
        res.status(500).json({error:'Error obteniendo fondos'});
    }
};

const getFondoReembolsos = async (req, res) => {
    try {
        const fondos = await service.obtenerFondos();
        const fondo = fondos.find(f => f.id === 2);
        res.json(fondo);
    } catch (error) {
        console.error({
            mensaje: error.message,
            stack: error.stack
        });
        res.status(500).json({error: 'Error obtenido fondo'});
    }
};

const recargarFondo = async (req, res) => {
    try {
        const {monto} = req.body;
        if (!monto || monto <= 0){
            return res.status(400).json({
                error:'Monto inválido'
            });
        }
        const cuenta_id = 2;
        await service.registrarIngresoPedido({
            pedido_id: 0,
            monto,
            subtipo: 'fondo',
            modulo_origen: 'reembolso',
            descripcion: 'Recarga fondo reembolsos'
        });
        res.json({ok: true, mensaje: 'Fondo recargado'});
    } catch (error) {
        console.error({
            mensaje: error.message,
            stack: error.stack
        });        
        res.status(500).json({error: 'Error recargando fondo'});
    }
};

module.exports = {
    ingresoPedido,
    egreso,
    getFondos,
    getFondoReembolsos,
    recargarFondo
}