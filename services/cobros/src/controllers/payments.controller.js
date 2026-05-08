const paymentsService = require("../services/payments.service");
const {
  validateCalculatePayload,
  validateCreatePaymentPayload,
  validateCancelPaymentPayload,
  validateRefundPaymentPayload
} = require("../validators/payments.validator");

async function calculate(req, res) {
  try {
    validateCalculatePayload(req.body);
    const result = await paymentsService.calculatePreview(req.body);
    return res.json({ ok: true, result });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function create(req, res) {
  try {
    validateCreatePaymentPayload(req.body);
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

async function cancel(req, res) {
  try {
    validateCancelPaymentPayload(req.body);
    const result = await paymentsService.cancelPayment(req.params.paymentId, req.body);
    return res.json({ ok: true, result });
  } catch (error) {
    const status = error.message === "Payment not found" ? 404 : 400;
    return res.status(status).json({ ok: false, error: error.message });
  }
}

async function refund(req, res) {
  try {
    validateRefundPaymentPayload(req.body);
    const result = await paymentsService.refundPayment(req.params.paymentId, req.body);
    return res.json({ ok: true, result });
  } catch (error) {
    const status = error.message === "Payment not found" ? 404 : 400;
    return res.status(status).json({ ok: false, error: error.message });
  }
}

module.exports = {
  calculate,
  create,
  getById,
  list,
  cancel,
  refund
};
