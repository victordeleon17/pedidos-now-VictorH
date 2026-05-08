const walletService = require("../services/wallet.service");
const {
  validateWalletSummaryQuery,
  validatePayPendingPayload
} = require("../validators/wallet.validator");

async function summary(req, res) {
  try {
    validateWalletSummaryQuery(req.query);
    const result = await walletService.getWalletSummary({
      courierId: req.query.courierId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });

    return res.json({ ok: true, result });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function payPending(req, res) {
  try {
    validatePayPendingPayload(req.body);
    const result = await walletService.payPending(req.body);
    return res.json({ ok: true, result });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

module.exports = {
  summary,
  payPending
};
