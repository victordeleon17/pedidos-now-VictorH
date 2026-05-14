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
///////
router.post(
  '/api/cupones/lealtad',
  crearCuponLealtad
);


// =========================
// ADMIN - ACTIVAR CUPON
// =========================
router.patch(
  '/api/cupones/:id/activar',
  activarCupon
);

// =========================
// ADMIN - CANCELAR CUPON
// =========================
router.patch(
  '/api/cupones/:id/cancelar',
  cancelarCupon
);

// =========================
// ADMIN - VENCER CUPONES
// =========================
router.patch(
  '/api/cupones/vencer',
  vencerCupones
);

// =========================
// ADMIN - CUPON POR CODIGO
// =========================
router.get(
  '/api/cupones/codigo/:codigo',
  getCuponByCodigo
);


// =========================
// ADMIN - CUPON POR ID
// =========================
router.get(
  '/api/cupones/:id',
  getCuponById
);

module.exports = router;