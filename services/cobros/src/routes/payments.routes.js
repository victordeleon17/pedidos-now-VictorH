const express = require("express");
const router = express.Router();

const controller = require("../controllers/payments.controller");

router.post("/payments/calculate", controller.calculate);
router.post("/payments", controller.create);
router.get("/payments/:paymentId", controller.getById);
router.get("/payments", controller.list);

module.exports = router;