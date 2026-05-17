function validateWalletSummaryQuery(query) {
  if (!query.courierId) {
    throw new Error("courierId is required");
  }
}

function validatePayPendingPayload(body) {
  if (!body.courierId) {
    throw new Error("courierId is required");
  }

  if (!body.transactionId && !body.orderId) {
    throw new Error("transactionId or orderId is required");
  }
}

module.exports = {
  validateWalletSummaryQuery,
  validatePayPendingPayload,
};