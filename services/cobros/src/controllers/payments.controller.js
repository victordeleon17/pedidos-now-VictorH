const { ok, fail } = require("../helpers/responses");
const paymentsService = require("../services/payments.service");
const {
  validateCalculatePayload,
  validateCreatePaymentPayload,
} = require("../validators/payments.validator");

async function calculate(req, res) {
  try {
    validateCalculatePayload(req.body);
    const result = await paymentsService.calculatePreview(req.body);
    return ok(res, result);
  } catch (error) {
    return fail(res, error.message, 400);
  }
}

async function create(req, res) {
  try {
    validateCreatePaymentPayload(req.body);
    const result = await paymentsService.createPayment(req.body);
    return ok(res, result, 201);
  } catch (error) {
    return fail(res, error.message, 400);
  }
}

async function getById(req, res) {
  try {
    const result = await paymentsService.getPaymentById(req.params.paymentId);

    if (!result) {
      return fail(res, "Payment not found", 404);
    }

    return ok(res, result);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

async function list(req, res) {
  try {
    const result = await paymentsService.listPayments(req.query);
    return ok(res, result);
  } catch (error) {
    return fail(res, error.message, 400);
  }
}

module.exports = {
  calculate,
  create,
  getById,
  list,
};