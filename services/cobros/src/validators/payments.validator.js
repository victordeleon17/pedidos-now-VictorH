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

  const numericFields = [
    "product_discounts",
    "coupon_discount",
    "service_fee",
    "tip_amount",
    "weight_lbs",
    "insurance_value"
  ];

  for (const field of numericFields) {
    if (body[field] !== undefined && Number(body[field]) < 0) {
      throw new Error(`${field} must be greater than or equal to 0`);
    }
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

  if (!body.courier_id) {
    throw new Error("courier_id is required");
  }

  if (body.payment_method_code === "COUPON" && Number(body.coupon_discount || 0) <= 0) {
    throw new Error("coupon_discount is required when payment_method_code is COUPON");
  }

  if (["CARD_CREDIT", "CARD_DEBIT"].includes(body.payment_method_code) && !body.card_type) {
    throw new Error("card_type is required for card payments");
  }
}

function validateCancelPaymentPayload(body) {
  if (body && body.reason !== undefined && String(body.reason).trim() === "") {
    throw new Error("reason must not be empty");
  }
}

function validateRefundPaymentPayload(body) {
  if (!body || body.amount === undefined || Number(body.amount) <= 0) {
    throw new Error("amount is required and must be greater than 0");
  }
}

module.exports = {
  validateCalculatePayload,
  validateCreatePaymentPayload,
  validateCancelPaymentPayload,
  validateRefundPaymentPayload,
};
