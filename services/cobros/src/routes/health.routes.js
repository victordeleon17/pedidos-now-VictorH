const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, service: "cobros", db: "ok" });
  } catch (err) {
    res.status(500).json({ ok: false, service: "payments", db: "fail", error: err.message });
  }
});

module.exports = router;