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
router.post('/admin/promociones/reportes', syncPromociones);

// GET
router.get('/admin/promociones/reportes', getReportes);

// =========================
// ADMIN - PROMOCION FLASH
// =========================
router.post(
  '/admin/promociones/flash',
  crearPromocionFlash
);

// =========================
// GET - PROMOCIONES FLASH
// =========================
router.get(
  '/admin/promociones/flash',
  getPromocionesFlash
);

// =========================
// ADMIN - GET PROMOCION FLASH POR ID
// =========================
router.get(
  '/admin/promociones/flash/:id',
  getPromocionFlashById
);

// =========================
// GET - PROMOCIONES FLASH VIGENTES
// =========================
router.get(
  '/admin/promociones/flash/vigentes',
  getPromocionesFlashVigentes
);

// =========================
// ADMIN - GET PROMOCIONES
// =========================
router.get(
  '/admin/promociones',
  getPromociones
);

// =========================
// ADMIN - CAMBIAR ESTADO PROMOCION
// =========================
router.patch(
  '/admin/promociones/:id/estado',
  cambiarEstadoPromocion
);

// =========================
// ADMIN - GET PROMOCION POR ID
// =========================
router.get(
  '/admin/promociones/:id',
  getPromocionById
);

module.exports = router;