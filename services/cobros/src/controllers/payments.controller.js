const paymentsService = require("../services/payments.service");

async function calculate(req, res) {
  try {
    const result = await paymentsService.calculatePreview(req.body);
    return res.json({ ok: true, result });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function create(req, res) {
  try {
    const result = await paymentsService.createPayment(req.body);
    return res.status(201).json({ ok: true, result });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function getById(req, res) {
  try {
    const result = await paymentsService.getPaymentById(req.params.paymentId);

    if (!result) {
      return res.status(404).json({ ok: false, error: "Payment not found" });
    }

    return res.json({ ok: true, result });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function list(req, res) {
  try {
    const result = await paymentsService.listPayments(req.query);
    return res.json({ ok: true, result });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

module.exports = {
  calculate,
  create,
  getById,
  list
};