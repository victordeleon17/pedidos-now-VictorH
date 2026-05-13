const express = require('express');
const router = express.Router();

const controller = require('../controllers/movimiento.controller');
const { validarToken } = require('../middleware/auth');
const { validarMonto } = require('../middleware/validar');


/**
 * @swagger
 * /api/movimientos/test:
 *   get:
 *     summary: Probar que las rutas de movimientos funcionan
 *     tags: [Movimientos]
 *     responses:
 *       200:
 *         description: Ruta de prueba funcionando
 */
// Health/test de este módulo
router.get('/test', (req, res) => {
    res.json({
        ok: true,
        message: 'Movimiento OK'
    });
});


/**
 * @swagger
 * /api/movimientos:
 *   get:
 *     summary: Obtener todos los movimientos financieros
 *     tags: [Movimientos]
 *     responses:
 *       200:
 *         description: Lista de movimientos financieros
 */
// Rutas públicas / consulta
router.get('/', controller.getAllMovimientos);


/**
 * @swagger
 * /api/movimientos/fondos:
 *   get:
 *     summary: Obtener fondos registrados
 *     tags: [Movimientos]
 *     responses:
 *       200:
 *         description: Lista de fondos registrados
 */
router.get('/fondos', controller.getFondos);


/**
 * @swagger
 * /api/movimientos/fondos/reembolsos:
 *   get:
 *     summary: Obtener saldo del fondo de reembolsos
 *     tags: [Movimientos]
 *     responses:
 *       200:
 *         description: Saldo del fondo de reembolsos
 */
router.get('/fondos/reembolsos', controller.getFondoReembolsos);


/**
 * @swagger
 * /api/movimientos/{id}:
 *   get:
 *     summary: Obtener movimiento financiero por ID
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del movimiento financiero
 *     responses:
 *       200:
 *         description: Movimiento encontrado
 *       404:
 *         description: Movimiento no encontrado
 */
// Rutas con ID
router.get('/:id', controller.getMovimientoById);


/**
 * @swagger
 * /api/movimientos/ingreso-pedido:
 *   post:
 *     summary: Registrar ingreso por pedido desde Broker u otro módulo
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearMovimiento'
 *     responses:
 *       201:
 *         description: Ingreso por pedido registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
// Rutas de operación desde Broker u otros servicios
router.post('/ingreso-pedido', validarToken, validarMonto, controller.ingresoPedido);


/**
 * @swagger
 * /api/movimientos/egreso:
 *   post:
 *     summary: Registrar egreso financiero
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearMovimiento'
 *     responses:
 *       201:
 *         description: Egreso registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/egreso', validarToken, validarMonto, controller.egreso);


/**
 * @swagger
 * /api/movimientos/fondos/reembolsos/recargar:
 *   post:
 *     summary: Recargar fondo de reembolsos
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearMovimiento'
 *     responses:
 *       201:
 *         description: Fondo de reembolsos recargado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/fondos/reembolsos/recargar', validarToken, validarMonto, controller.recargarFondo);


/**
 * @swagger
 * /api/movimientos:
 *   post:
 *     summary: Crear movimiento financiero
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearMovimiento'
 *     responses:
 *       201:
 *         description: Movimiento creado correctamente
 *       400:
 *         description: Datos inválidos
 */
// CRUD general preparado para integración
router.post('/', validarToken, validarMonto, controller.crearMovimiento);


/**
 * @swagger
 * /api/movimientos/{id}:
 *   put:
 *     summary: Actualizar movimiento financiero
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del movimiento financiero
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearMovimiento'
 *     responses:
 *       200:
 *         description: Movimiento actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Movimiento no encontrado
 */
router.put('/:id', validarToken, validarMonto, controller.updateMovimiento);


/**
 * @swagger
 * /api/movimientos/{id}:
 *   delete:
 *     summary: Eliminar movimiento financiero
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del movimiento financiero
 *     responses:
 *       200:
 *         description: Movimiento eliminado correctamente
 *       404:
 *         description: Movimiento no encontrado
 */
router.delete('/:id', validarToken, controller.deleteMovimiento);

module.exports = router;