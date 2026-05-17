const express = require("express");
const router = express.Router();
const controller = require("../controllers/wallet.controller");

router.get("/wallet/summary", controller.summary);
router.post("/wallet/pay-pending", controller.payPending);

module.exports = router;