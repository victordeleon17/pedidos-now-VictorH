const { ok, fail } = require("../helpers/responses");
const walletService = require("../services/wallet.service");
const {
  validateWalletSummaryQuery,
  validatePayPendingPayload,
} = require("../validators/wallet.validator");

async function summary(req, res) {
  try {
    validateWalletSummaryQuery(req.query);

    const result = await walletService.getWalletSummary({
      courierId: req.query.courierId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    return ok(res, result);
  } catch (error) {
    return fail(res, error.message, 400);
  }
}

async function payPending(req, res) {
  try {
    validatePayPendingPayload(req.body);

    const result = await walletService.payPending({
      courierId: req.body.courierId,
      transactionId: req.body.transactionId,
      orderId: req.body.orderId,
    });

    return ok(res, result);
  } catch (error) {
    return fail(res, error.message, 400);
  }
}

module.exports = {
  summary,
  payPending,
};