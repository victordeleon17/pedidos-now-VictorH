const paymentsService = require("../services/payments.service");

async function calculate(req, res) {
  try {
    const result = await paymentsService.calculatePreview(req.body);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

async function create(req, res) {
  try {
    const result = await paymentsService.createPayment(req.body);
    res.status(201).json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

async function getById(req, res) {
  try {
    const { paymentId } = req.params;
    const payment = await paymentsService.getPaymentById(paymentId);
    if (!payment) return res.status(404).json({ ok: false, error: "Payment not found" });
    res.json({ ok: true, result: payment });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function list(req, res) {
  try {
    const { orderSnapshotId, reservationId } = req.query;
    const rows = await paymentsService.listPayments({ orderSnapshotId, reservationId });
    res.json({ ok: true, result: rows });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

module.exports = { calculate, create, getById, list };