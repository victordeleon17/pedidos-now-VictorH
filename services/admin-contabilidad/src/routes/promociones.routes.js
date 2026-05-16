//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

const {
  syncPromociones,
  getReportes,
  crearPromocionFlash,
  getPromocionesFlash,
  getPromocionFlashById,
  getPromocionesFlashVigentes,
  getPromociones,
  cambiarEstadoPromocion,
  getPromocionById
} = require('../controllers/promociones.controller');

// POST

/**
 * @swagger
 * /api/promociones/reportes:
 *   post:
 *     summary: Sincronizar promociones
 *     tags: [Promociones]
 *     responses:
 *       200:
 *         description: Promociones sincronizadas
 */

router.post('/api/promociones/reportes', syncPromociones);

// GET

/**
 * @swagger
 * /api/promociones/reportes:
 *   get:
 *     summary: Obtener reportes de promociones
 *     tags: [Promociones]
 *     responses:
 *       200:
 *         description: Lista de reportes
 */

router.get('/api/promociones/reportes', getReportes);

// =========================
// ADMIN - PROMOCION FLASH
// =========================

/**
 * @swagger
 * /api/promociones-flash:
 *   post:
 *     summary: Crear promoción flash
 *     tags: [Promociones Flash]
 *     responses:
 *       201:
 *         description: Promoción flash creada
 */

router.post(
  '/api/promociones-flash',
  crearPromocionFlash
);

// =========================
// GET - PROMOCIONES FLASH
// =========================

/**
 * @swagger
 * /api/promociones-flash:
 *   get:
 *     summary: Obtener promociones flash
 *     tags: [Promociones Flash]
 *     responses:
 *       200:
 *         description: Lista de promociones flash
 */

router.get(
  '/api/promociones-flash',
  getPromocionesFlash
);

// =========================
// ADMIN - GET PROMOCION FLASH POR ID
// =========================

/**
 * @swagger
 * /api/promociones-flash/{id}:
 *   get:
 *     summary: Obtener promoción flash por ID
 *     tags: [Promociones Flash]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción encontrada
 */

router.get(
  '/api/promociones-flash/:id',
  getPromocionFlashById
);

// =========================
// GET - PROMOCIONES FLASH VIGENTES
// =========================

/**
 * @swagger
 * /api/promociones-flash/vigentes:
 *   get:
 *     summary: Obtener promociones flash vigentes
 *     tags: [Promociones Flash]
 *     responses:
 *       200:
 *         description: Lista de promociones vigentes
 */

router.get(
  '/api/promociones-flash/vigentes',
  getPromocionesFlashVigentes
);

// =========================
// ADMIN - GET PROMOCIONES
// =========================

/**
 * @swagger
 * /api/promociones:
 *   get:
 *     summary: Obtener promociones
 *     tags: [Promociones]
 *     responses:
 *       200:
 *         description: Lista de promociones
 */

router.get(
  '/api/promociones',
  getPromociones
);

// =========================
// ADMIN - CAMBIAR ESTADO PROMOCION
// =========================

/**
 * @swagger
 * /api/promociones/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de promoción
 *     tags: [Promociones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado actualizado
 */

router.patch(
  '/api/promociones/:id/estado',
  cambiarEstadoPromocion
);

// =========================
// ADMIN - GET PROMOCION POR ID
// =========================

/**
 * @swagger
 * /api/promociones/{id}:
 *   get:
 *     summary: Obtener promoción por ID
 *     tags: [Promociones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción encontrada
 */

router.get(
  '/api/promociones/:id',
  getPromocionById
);

module.exports = router;