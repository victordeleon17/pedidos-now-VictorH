// Admin-contabilidad Victor

const express = require('express');
const router = express.Router();

const controller = require('../controllers/reportesNegocios.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { validarMonto } = require('../middleware/validar');

/**
 * @swagger
 * /api/reportes-negocios/health:
 *   get:
 *     summary: Verificar conexión con el microservicio de Negocios
 *     tags: [Reportes Negocios]
 *     responses:
 *       200:
 *         description: Conexión exitosa con Negocios
 *       500:
 *         description: Error de conexión con Negocios
 */
router.get('/health', controller.healthNegocios);

/**
 * @swagger
 * /api/reportes-negocios/businesses:
 *   get:
 *     summary: Listar negocios desde el microservicio de Negocios
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto de búsqueda
 *       - in: query
 *         name: businessStatus
 *         schema:
 *           type: string
 *         description: Estado del negocio
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *         description: Tipo de negocio
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *         description: Incluir negocios eliminados lógicamente
 *     responses:
 *       200:
 *         description: Lista de negocios
 */
router.get('/businesses', controller.listarNegocios);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}:
 *   get:
 *     summary: Obtener detalle de un negocio por ID
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     responses:
 *       200:
 *         description: Detalle del negocio
 */
router.get('/businesses/:businessId', controller.obtenerNegocioPorId);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}/catalog:
 *   get:
 *     summary: Obtener catálogo de un negocio
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     responses:
 *       200:
 *         description: Catálogo del negocio
 */
router.get('/businesses/:businessId/catalog', controller.obtenerCatalogoNegocio);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}/products:
 *   get:
 *     summary: Obtener productos de un negocio
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *       - in: query
 *         name: visibleInCatalog
 *         schema:
 *           type: boolean
 *         description: Filtrar productos visibles en catálogo
 *     responses:
 *       200:
 *         description: Productos del negocio
 */
router.get('/businesses/:businessId/products', controller.obtenerProductosNegocio);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}/inventory:
 *   get:
 *     summary: Obtener inventario de un negocio
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     responses:
 *       200:
 *         description: Inventario del negocio
 */
router.get('/businesses/:businessId/inventory', controller.obtenerInventarioNegocio);

/**
 * @swagger
 * /api/reportes-negocios/businesses/{businessId}/inventory/products/{productId}:
 *   get:
 *     summary: Obtener stock de un producto de negocio
 *     tags: [Reportes Negocios]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Stock del producto
 */
router.get('/businesses/:businessId/inventory/products/:productId', controller.obtenerStockProducto);

/**
 * @swagger
 * /api/reportes-negocios/movimientos/pedido:
 *   post:
 *     summary: Registrar ingreso financiero por pedido de negocio
 *     tags: [Reportes Negocios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *             properties:
 *               cuenta_id:
 *                 type: integer
 *                 example: 1
 *               referencia_id:
 *                 type: integer
 *                 example: 202
 *               monto:
 *                 type: number
 *                 example: 320.75
 *               descripcion:
 *                 type: string
 *                 example: Ingreso por pedido de negocio
 *               pedido_id:
 *                 type: integer
 *                 example: 202
 *               repartidor_id:
 *                 type: integer
 *                 example: 22
 *               estado:
 *                 type: string
 *                 example: procesado
 *     responses:
 *       201:
 *         description: Movimiento registrado correctamente
 */
router.post('/movimientos/pedido', verificarToken, validarMonto, controller.registrarMovimientoNegocio);

/**
 * @swagger
 * /api/reportes-negocios/movimientos/cancelacion:
 *   post:
 *     summary: Registrar cancelación financiera de negocio
 *     tags: [Reportes Negocios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Cancelación registrada correctamente
 */
router.post('/movimientos/cancelacion', verificarToken, controller.registrarCancelacionNegocio);

/**
 * @swagger
 * /api/reportes-negocios/movimientos/descuento:
 *   post:
 *     summary: Registrar descuento financiero aplicado por negocio
 *     tags: [Reportes Negocios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Descuento registrado correctamente
 */
router.post('/movimientos/descuento', verificarToken, validarMonto, controller.registrarDescuentoNegocio);

module.exports = router;