const express = require("express");
const router = express.Router();
const { sequelize } = require("../../models");

router.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();

    return res.json({
      ok: true,
      service: "cobros",
      db: "ok"
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      service: "cobros",
      db: "fail",
      error: error.message
    });
  }
});

module.exports = router;