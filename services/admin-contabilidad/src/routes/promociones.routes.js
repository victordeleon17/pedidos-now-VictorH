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
router.post('/api/promociones/reportes', syncPromociones);

// GET
router.get('/api/promociones/reportes', getReportes);

// =========================
// ADMIN - PROMOCION FLASH
// =========================
router.post(
  '/api/promociones-flash',
  crearPromocionFlash
);

// =========================
// GET - PROMOCIONES FLASH
// =========================
router.get(
  '/api/promociones-flash',
  getPromocionesFlash
);

// =========================
// ADMIN - GET PROMOCION FLASH POR ID
// =========================
router.get(
  '/api/promociones-flash/:id',
  getPromocionFlashById
);

// =========================
// GET - PROMOCIONES FLASH VIGENTES
// =========================
router.get(
  '/api/promociones-flash/vigentes',
  getPromocionesFlashVigentes
);

// =========================
// ADMIN - GET PROMOCIONES
// =========================
router.get(
  '/api/promociones',
  getPromociones
);

// =========================
// ADMIN - CAMBIAR ESTADO PROMOCION
// =========================
router.patch(
  '/api/promociones/:id/estado',
  cambiarEstadoPromocion
);

// =========================
// ADMIN - GET PROMOCION POR ID
// =========================
router.get(
  '/api/promociones/:id',
  getPromocionById
);

module.exports = router;