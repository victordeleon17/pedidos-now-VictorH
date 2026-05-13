//Admin-conta Jeff. Daniel Ramos
const express = require('express');
const router = express.Router();

const {
  crearCuponLealtad,
  activarCupon,
  cancelarCupon,
  vencerCupones,
  getCuponById,
  getCuponByCodigo
} = require('../controllers/cupones.controller');

// =========================
// ADMIN - CUPONES LEALTAD
// =========================
router.post(
  '/admin/cupones/lealtad',
  crearCuponLealtad
);


// =========================
// ADMIN - ACTIVAR CUPON
// =========================
router.patch(
  '/admin/cupones/:id/activar',
  activarCupon
);

// =========================
// ADMIN - CANCELAR CUPON
// =========================
router.patch(
  '/admin/cupones/:id/cancelar',
  cancelarCupon
);

// =========================
// ADMIN - VENCER CUPONES
// =========================
router.patch(
  '/admin/cupones/vencer',
  vencerCupones
);

// =========================
// ADMIN - CUPON POR CODIGO
// =========================
router.get(
  '/admin/cupones/codigo/:codigo',
  getCuponByCodigo
);


// =========================
// ADMIN - CUPON POR ID
// =========================
router.get(
  '/admin/cupones/:id',
  getCuponById
);

module.exports = router;