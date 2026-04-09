function validateCalculatePayload(body) {
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    throw new Error("items is required and must be a non-empty array");
  }

  for (const item of body.items) {
    if (!item.product_id) throw new Error("Each item must include product_id");
    if (!item.product_name) throw new Error("Each item must include product_name");
    if (!item.quantity || Number(item.quantity) <= 0) throw new Error("Each item must include a valid quantity");
    if (item.unit_price === undefined || Number(item.unit_price) < 0) throw new Error("Each item must include a valid unit_price");
  }
}

function validateCreatePaymentPayload(body) {
  validateCalculatePayload(body);

  const required = [
    "customer_id",
    "business_id",
    "delivery_address_id",
    "reservation_id",
    "payment_method_code",
    "idempotency_key",
  ];

  for (const field of required) {
    if (!body[field]) throw new Error(`${field} is required`);
  }

  const validMethods = ["CASH", "CARD_CREDIT", "CARD_DEBIT", "COUPON"];
  if (!validMethods.includes(body.payment_method_code)) {
    throw new Error("payment_method_code must be CASH, CARD_CREDIT, CARD_DEBIT or COUPON");
  }

  if (body.payment_method_code !== "COUPON" && !body.courier_id) {
    throw new Error("courier_id is required for non-coupon payments");
  }
}

module.exports = {
  validateCalculatePayload,
  validateCreatePaymentPayload,
};