const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    return res.json({
      ok: true,
      service: "cobros",
      db: "ok",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      service: "cobros",
      db: "fail",
      error: error.message,
    });
  }
});

module.exports = router;