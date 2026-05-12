const movimientoRepository = require('../repositories/movimiento.repository');

const getAllMovimientos = async (req, res, next) => {
    try {
        const movimientos = await movimientoRepository.getAllMovimientos();

        res.json({
            ok: true,
            data: movimientos,
            count: movimientos.length
        });
    } catch (error) {
        next(error);
    }
};

const getMovimientoById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const movimiento = await movimientoRepository.getMovimientoById(id);

        if (!movimiento) {
            return res.status(404).json({
                ok: false,
                message: 'Movimiento no encontrado'
            });
        }

        res.json({
            ok: true,
            data: movimiento
        });
    } catch (error) {
        next(error);
    }
};

const crearMovimiento = async (req, res, next) => {
    try {
        const nuevoMovimiento = await movimientoRepository.crearMovimiento(req.body);

        res.status(201).json({
            ok: true,
            message: 'Movimiento creado correctamente',
            data: nuevoMovimiento
        });
    } catch (error) {
        next(error);
    }
};

const updateMovimiento = async (req, res, next) => {
    try {
        const { id } = req.params;

        const movimientoActualizado = await movimientoRepository.updateMovimiento(id, req.body);

        if (!movimientoActualizado) {
            return res.status(404).json({
                ok: false,
                message: 'Movimiento no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'Movimiento actualizado correctamente',
            data: movimientoActualizado
        });
    } catch (error) {
        next(error);
    }
};

const deleteMovimiento = async (req, res, next) => {
    try {
        const { id } = req.params;

        const eliminado = await movimientoRepository.deleteMovimiento(id);

        if (!eliminado) {
            return res.status(404).json({
                ok: false,
                message: 'Movimiento no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'Movimiento eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

const ingresoPedido = async (req, res, next) => {
    try {
        const movimiento = await movimientoRepository.ingresoPedido(req.body);

        res.status(201).json({
            ok: true,
            message: 'Ingreso por pedido registrado correctamente',
            data: movimiento
        });
    } catch (error) {
        next(error);
    }
};

const egreso = async (req, res, next) => {
    try {
        const movimiento = await movimientoRepository.egreso(req.body);

        res.status(201).json({
            ok: true,
            message: 'Egreso registrado correctamente',
            data: movimiento
        });
    } catch (error) {
        next(error);
    }
};

const getFondos = async (req, res, next) => {
    try {
        const fondos = await movimientoRepository.getFondos();

        res.json({
            ok: true,
            data: fondos
        });
    } catch (error) {
        next(error);
    }
};

const getFondoReembolsos = async (req, res, next) => {
    try {
        const fondo = await movimientoRepository.getFondoReembolsos();

        res.json({
            ok: true,
            data: fondo
        });
    } catch (error) {
        next(error);
    }
};

const recargarFondo = async (req, res, next) => {
    try {
        const fondo = await movimientoRepository.recargarFondo(req.body);

        res.status(201).json({
            ok: true,
            message: 'Fondo de reembolsos recargado correctamente',
            data: fondo
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllMovimientos,
    getMovimientoById,
    crearMovimiento,
    updateMovimiento,
    deleteMovimiento,
    ingresoPedido,
    egreso,
    getFondos,
    getFondoReembolsos,
    recargarFondo
};