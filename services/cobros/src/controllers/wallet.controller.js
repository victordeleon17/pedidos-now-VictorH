const walletService = require("../services/wallet.service");

async function summary(req, res) {
  try {
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