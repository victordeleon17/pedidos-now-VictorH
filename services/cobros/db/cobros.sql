-- ============================================================
-- PAYMENTS / COURIER WALLET DATABASE
-- Pedidos Now - Cobros + Virtual Wallet
-- MySQL 8+
-- ============================================================

DROP DATABASE IF EXISTS payments_db;

CREATE DATABASE payments_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE payments_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1) REFERENCE TABLES
-- ============================================================

CREATE TABLE payment_methods (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code              VARCHAR(30) NOT NULL UNIQUE,
  name              VARCHAR(50) NOT NULL UNIQUE,
  description       VARCHAR(255) NULL,
  is_active         TINYINT(1) NOT NULL DEFAULT 1,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE payment_statuses (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code              VARCHAR(50) NOT NULL UNIQUE,
  description       VARCHAR(255) NULL,
  is_active         TINYINT(1) NOT NULL DEFAULT 1,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2) COUPONS
-- ============================================================

CREATE TABLE coupons (
  id                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code                VARCHAR(50) NOT NULL UNIQUE,
  description         VARCHAR(255) NULL,
  discount_type       ENUM('PERCENTAGE','FIXED_AMOUNT') NOT NULL,
  discount_value      DECIMAL(10,2) NOT NULL,
  min_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(10,2) NULL,
  max_uses            INT UNSIGNED NULL,
  current_uses        INT UNSIGNED NOT NULL DEFAULT 0,
  start_date          DATETIME NOT NULL,
  end_date            DATETIME NOT NULL,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 3) FINANCIAL ORDER SNAPSHOT
--    This is NOT the operational order owner.
--    It is the financial frozen copy used by Payments.
-- ============================================================

CREATE TABLE orders_snapshot (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),

  customer_id           CHAR(36) NOT NULL,
  courier_id            CHAR(36) NULL,
  business_id           CHAR(36) NOT NULL,
  delivery_address_id   CHAR(36) NOT NULL,

  reservation_id        VARCHAR(64) NULL,
  external_business_id  VARCHAR(32) NULL,
  external_customer_id  VARCHAR(32) NULL,
  external_address_id   VARCHAR(32) NULL,

  subtotal              DECIMAL(10,2) NOT NULL DEFAULT 0,
  product_discounts     DECIMAL(10,2) NOT NULL DEFAULT 0,
  coupon_discount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  service_fee           DECIMAL(10,2) NOT NULL DEFAULT 0,
  courier_earned_fee    DECIMAL(10,2) NOT NULL DEFAULT 0,
  approved_extra_fee    DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_amount            DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency_code         CHAR(3) NOT NULL DEFAULT 'GTQ',

  final_payment_method_code VARCHAR(30) NULL,
  status_id             CHAR(36) NOT NULL,

  notes                 TEXT NULL,
  delivered_at          DATETIME NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_orders_snapshot_status
    FOREIGN KEY (status_id) REFERENCES payment_statuses(id)
) ENGINE=InnoDB;

CREATE INDEX idx_orders_snapshot_customer_id   ON orders_snapshot(customer_id);
CREATE INDEX idx_orders_snapshot_courier_id    ON orders_snapshot(courier_id);
CREATE INDEX idx_orders_snapshot_business_id   ON orders_snapshot(business_id);
CREATE INDEX idx_orders_snapshot_reservation   ON orders_snapshot(reservation_id);
CREATE INDEX idx_orders_snapshot_delivered_at  ON orders_snapshot(delivered_at);

CREATE TABLE order_items_snapshot (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id              CHAR(36) NOT NULL,

  product_id            CHAR(36) NOT NULL,
  external_product_id   VARCHAR(32) NULL,

  product_name          VARCHAR(255) NOT NULL,
  quantity              INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price            DECIMAL(10,2) NOT NULL,
  item_discount         DECIMAL(10,2) NOT NULL DEFAULT 0,
  item_subtotal         DECIMAL(10,2) NOT NULL,
  is_combo              TINYINT(1) NOT NULL DEFAULT 0,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_order_items_snapshot_order
    FOREIGN KEY (order_id) REFERENCES orders_snapshot(id)
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_snapshot_order_id ON order_items_snapshot(order_id);

CREATE TABLE order_status_history (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id              CHAR(36) NOT NULL,
  status_id             CHAR(36) NOT NULL,
  origin                ENUM('SYSTEM','CUSTOMER','COURIER','BUSINESS','ADMIN') NOT NULL DEFAULT 'SYSTEM',
  reason                VARCHAR(255) NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_order_status_history_order
    FOREIGN KEY (order_id) REFERENCES orders_snapshot(id),

  CONSTRAINT fk_order_status_history_status
    FOREIGN KEY (status_id) REFERENCES payment_statuses(id)
) ENGINE=InnoDB;

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- ============================================================
-- 4) PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),

  order_snapshot_id     CHAR(36) NOT NULL,
  courier_id            CHAR(36) NULL,

  reservation_id        VARCHAR(64) NULL,
  order_id              VARCHAR(64) NULL,
  external_payment_id   VARCHAR(64) NULL,

  idempotency_key       VARCHAR(128) NOT NULL UNIQUE,

  payment_method_id     CHAR(36) NOT NULL,
  coupon_id             CHAR(36) NULL,

  gross_amount          DECIMAL(10,2) NOT NULL,
  order_total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
  coupon_discount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_amount            DECIMAL(10,2) NOT NULL,
  service_fee           DECIMAL(10,2) NOT NULL DEFAULT 0,
  courier_earned_fee    DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_amount            DECIMAL(10,2) NOT NULL DEFAULT 0,
  resulting_balance_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_refunded        DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency_code         CHAR(3) NOT NULL DEFAULT 'GTQ',

  status_id             CHAR(36) NOT NULL,

  settlement_status     ENUM('NOT_APPLICABLE','PENDING','SETTLED','OVERDUE') NOT NULL DEFAULT 'NOT_APPLICABLE',
  settlement_due_at     DATETIME NULL,
  settled_at            DATETIME NULL,

  external_reference    VARCHAR(255) NULL,
  payment_gateway       VARCHAR(100) NULL,

  cancelled_by          ENUM('CUSTOMER','COURIER','BUSINESS','SYSTEM') NULL,
  cancellation_reason   VARCHAR(255) NULL,

  ip_address            VARCHAR(45) NULL,
  request_id            VARCHAR(64) NULL,
  correlation_id        VARCHAR(64) NULL,
  origin_service        VARCHAR(50) NULL,

  paid_at               DATETIME NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_payments_order_snapshot
    FOREIGN KEY (order_snapshot_id) REFERENCES orders_snapshot(id),

  CONSTRAINT fk_payments_method
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),

  CONSTRAINT fk_payments_coupon
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),

  CONSTRAINT fk_payments_status
    FOREIGN KEY (status_id) REFERENCES payment_statuses(id),

  UNIQUE KEY uq_payments_order_snapshot   (order_snapshot_id),
  UNIQUE KEY uq_payments_order_id         (order_id),
  UNIQUE KEY uq_payments_external_payment (external_payment_id)
) ENGINE=InnoDB;

CREATE INDEX idx_payments_courier_id         ON payments(courier_id);
CREATE INDEX idx_payments_reservation_id     ON payments(reservation_id);
CREATE INDEX idx_payments_status_id          ON payments(status_id);
CREATE INDEX idx_payments_settlement_status  ON payments(settlement_status);
CREATE INDEX idx_payments_settlement_due_at  ON payments(settlement_due_at);
CREATE INDEX idx_payments_created_at         ON payments(created_at);

-- ============================================================
-- 5) PAYMENT ATTEMPTS
-- ============================================================

CREATE TABLE payment_attempts (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_id            CHAR(36) NOT NULL,

  result                ENUM('SUCCESS','DENIED','ERROR','TIMEOUT') NOT NULL,
  external_reference    VARCHAR(255) NULL,
  response_code         VARCHAR(50) NULL,
  response_message      VARCHAR(500) NULL,

  request_payload       JSON NULL,
  response_payload      JSON NULL,

  request_id            VARCHAR(64) NULL,
  correlation_id        VARCHAR(64) NULL,
  origin_service        VARCHAR(50) NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_payment_attempts_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE INDEX idx_payment_attempts_payment_id ON payment_attempts(payment_id);

-- ============================================================
-- 6) PAYMENT DISCOUNTS APPLIED
-- ============================================================

CREATE TABLE payment_discounts_applied (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_id            CHAR(36) NOT NULL,

  type                  ENUM('COUPON','PROMO','OTHER') NOT NULL DEFAULT 'COUPON',
  code                  VARCHAR(50) NULL,
  description           VARCHAR(255) NULL,
  amount                DECIMAL(10,2) NOT NULL DEFAULT 0,
  source                VARCHAR(50) NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_payment_discounts_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE INDEX idx_payment_discounts_payment_id ON payment_discounts_applied(payment_id);

-- ============================================================
-- 7) REFUNDS
-- ============================================================

CREATE TABLE refunds (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_id            CHAR(36) NOT NULL,

  order_id              VARCHAR(64) NULL,
  external_payment_id   VARCHAR(64) NULL,

  refund_amount         DECIMAL(10,2) NOT NULL,
  currency_code         CHAR(3) NOT NULL DEFAULT 'GTQ',

  status                ENUM('PENDING','APPROVED','DENIED','ERROR') NOT NULL DEFAULT 'PENDING',
  external_reference    VARCHAR(255) NULL,
  reason                VARCHAR(255) NULL,

  request_id            VARCHAR(64) NULL,
  correlation_id        VARCHAR(64) NULL,
  origin_service        VARCHAR(50) NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_refunds_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_order_id   ON refunds(order_id);

-- ============================================================
-- 8) COURIER WALLETS
-- ============================================================

CREATE TABLE courier_wallets (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  courier_id            CHAR(36) NOT NULL UNIQUE,

  current_balance       DECIMAL(12,2) NOT NULL DEFAULT 0,
  pending_debt_balance  DECIMAL(12,2) NOT NULL DEFAULT 0,
  available_balance     DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_earned          DECIMAL(12,2) NOT NULL DEFAULT 0,

  account_status        ENUM('ACTIVE','INACTIVE','BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  grace_until           DATETIME NULL,
  critical_overdue_at   DATETIME NULL,

  linked_bank_account_ref VARCHAR(100) NULL,
  linked_debit_card_ref VARCHAR(100) NULL,
  blocked_reason        VARCHAR(255) NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_courier_wallets_account_status ON courier_wallets(account_status);

-- ============================================================
-- 9) COURIER TRANSACTIONS
--    Main transaction history used for wallet summary
-- ============================================================

CREATE TABLE courier_transactions (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  courier_id            CHAR(36) NOT NULL,
  payment_id            CHAR(36) NOT NULL,
  order_id              VARCHAR(64) NULL,
  order_snapshot_id     CHAR(36) NULL,

  type                  ENUM('CREDIT','DEBIT') NOT NULL,
  transaction_category  ENUM(
                          'CARD_EARNING',
                          'CASH_DEBT',
                          'CASH_SETTLEMENT',
                          'WITHDRAWAL',
                          'REFUND',
                          'PENALTY',
                          'COMPENSATION',
                          'FARE_ADJUSTMENT'
                        ) NOT NULL DEFAULT 'CARD_EARNING',

  payment_method_code   VARCHAR(30) NULL,
  amount                DECIMAL(10,2) NOT NULL,
  order_total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
  courier_earned_fee    DECIMAL(10,2) NOT NULL DEFAULT 0,

  previous_balance      DECIMAL(12,2) NOT NULL,
  new_balance           DECIMAL(12,2) NOT NULL,
  resulting_signed_balance DECIMAL(12,2) NOT NULL DEFAULT 0,

  settlement_status     ENUM('NOT_APPLICABLE','PENDING','SETTLED','OVERDUE','CANCELLED') NOT NULL DEFAULT 'NOT_APPLICABLE',
  due_at                DATETIME NULL,
  settled_at            DATETIME NULL,
  can_pay_pending       TINYINT(1) NOT NULL DEFAULT 0,

  external_bank_reference VARCHAR(255) NULL,
  description           VARCHAR(255) NULL,
  notes                 TEXT NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_courier_transactions_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id),

  CONSTRAINT fk_courier_transactions_order_snapshot
    FOREIGN KEY (order_snapshot_id) REFERENCES orders_snapshot(id),

  CONSTRAINT fk_courier_transactions_wallet
    FOREIGN KEY (courier_id) REFERENCES courier_wallets(courier_id)
) ENGINE=InnoDB;

CREATE INDEX idx_courier_transactions_courier_id        ON courier_transactions(courier_id);
CREATE INDEX idx_courier_transactions_payment_id        ON courier_transactions(payment_id);
CREATE INDEX idx_courier_transactions_order_id          ON courier_transactions(order_id);
CREATE INDEX idx_courier_transactions_category          ON courier_transactions(transaction_category);
CREATE INDEX idx_courier_transactions_settlement_status ON courier_transactions(settlement_status);
CREATE INDEX idx_courier_transactions_due_at            ON courier_transactions(due_at);
CREATE INDEX idx_courier_transactions_created_at        ON courier_transactions(created_at);

-- ============================================================
-- 10) WALLET SETTLEMENTS
--     Used by POST /api/wallet/pay-pending
-- ============================================================

CREATE TABLE wallet_settlements (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  courier_id            CHAR(36) NOT NULL,
  payment_id            CHAR(36) NOT NULL,
  courier_transaction_id CHAR(36) NOT NULL,
  order_id              VARCHAR(64) NULL,

  settlement_amount     DECIMAL(10,2) NOT NULL,
  currency_code         CHAR(3) NOT NULL DEFAULT 'GTQ',

  status                ENUM('PENDING','APPROVED','DENIED','ERROR') NOT NULL DEFAULT 'PENDING',
  source_method_ref     VARCHAR(100) NULL,
  external_reference    VARCHAR(255) NULL,
  response_code         VARCHAR(50) NULL,
  response_message      VARCHAR(500) NULL,

  request_id            VARCHAR(64) NULL,
  correlation_id        VARCHAR(64) NULL,
  origin_service        VARCHAR(50) NULL,

  paid_at               DATETIME NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_wallet_settlements_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id),

  CONSTRAINT fk_wallet_settlements_tx
    FOREIGN KEY (courier_transaction_id) REFERENCES courier_transactions(id)
) ENGINE=InnoDB;

CREATE INDEX idx_wallet_settlements_courier_id ON wallet_settlements(courier_id);
CREATE INDEX idx_wallet_settlements_order_id   ON wallet_settlements(order_id);
CREATE INDEX idx_wallet_settlements_status     ON wallet_settlements(status);

-- ============================================================
-- 11) WALLET WITHDRAWALS
--     Used by "transfer available balance to bank account"
-- ============================================================

CREATE TABLE wallet_withdrawals (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  courier_id            CHAR(36) NOT NULL,
  wallet_id             CHAR(36) NOT NULL,

  withdrawal_amount     DECIMAL(10,2) NOT NULL,
  currency_code         CHAR(3) NOT NULL DEFAULT 'GTQ',

  destination_account_ref VARCHAR(100) NULL,
  status                ENUM('PENDING','APPROVED','DENIED','ERROR') NOT NULL DEFAULT 'PENDING',
  external_reference    VARCHAR(255) NULL,
  response_code         VARCHAR(50) NULL,
  response_message      VARCHAR(500) NULL,

  requested_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at          DATETIME NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_wallet_withdrawals_wallet
    FOREIGN KEY (wallet_id) REFERENCES courier_wallets(id)
) ENGINE=InnoDB;

CREATE INDEX idx_wallet_withdrawals_courier_id ON wallet_withdrawals(courier_id);
CREATE INDEX idx_wallet_withdrawals_status     ON wallet_withdrawals(status);

-- ============================================================
-- 12) WALLET ADJUSTMENTS
--     Manual/authorized financial changes
-- ============================================================

CREATE TABLE wallet_adjustments (
  id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  courier_id            CHAR(36) NOT NULL,
  payment_id            CHAR(36) NULL,
  order_id              VARCHAR(64) NULL,

  adjustment_type       ENUM('PENALTY','COMPENSATION','FARE_ADJUSTMENT','MANUAL_CORRECTION') NOT NULL,
  amount                DECIMAL(10,2) NOT NULL,
  currency_code         CHAR(3) NOT NULL DEFAULT 'GTQ',

  reason                VARCHAR(255) NULL,
  authorized_by_service VARCHAR(50) NULL,

  request_id            VARCHAR(64) NULL,
  correlation_id        VARCHAR(64) NULL,

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_wallet_adjustments_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE INDEX idx_wallet_adjustments_courier_id ON wallet_adjustments(courier_id);
CREATE INDEX idx_wallet_adjustments_order_id   ON wallet_adjustments(order_id);

-- ============================================================
-- 13) SEED DATA
-- ============================================================

INSERT INTO payment_methods (code, name, description, is_active) VALUES
  ('CASH',        'cash',        'Cash payment to courier', 1),
  ('CARD_CREDIT', 'card_credit', 'Credit card payment', 1),
  ('CARD_DEBIT',  'card_debit',  'Debit card payment', 1),
  ('COUPON',      'coupon',      'Coupon payment', 1);

INSERT INTO payment_statuses (code, description, is_active) VALUES
  ('PENDING',             'Payment pending', 1),
  ('PROCESSING',          'Payment processing', 1),
  ('APPROVED',            'Payment approved', 1),
  ('DENIED',              'Payment denied', 1),
  ('CANCELLED',           'Payment cancelled', 1),
  ('PARTIALLY_REFUNDED',  'Payment partially refunded', 1),
  ('REFUNDED',            'Payment refunded', 1),
  ('SETTLEMENT_PENDING',  'Cash order pending liquidation by courier', 1),
  ('SETTLED',             'Cash order settled by courier', 1),
  ('OVERDUE',             'Cash order settlement overdue', 1),
  ('BLOCKED',             'Courier blocked due to overdue debt', 1);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 14) OPTIONAL VIEW FOR WALLET SUMMARY
-- ============================================================

CREATE OR REPLACE VIEW vw_courier_wallet_summary AS
SELECT
  cw.id AS wallet_id,
  cw.courier_id,
  cw.current_balance,
  cw.pending_debt_balance,
  cw.available_balance,
  cw.total_earned,
  cw.account_status,
  cw.grace_until,
  cw.critical_overdue_at,
  COUNT(CASE WHEN ct.settlement_status = 'PENDING' THEN 1 END) AS pending_cash_orders,
  COUNT(CASE WHEN ct.settlement_status = 'OVERDUE' THEN 1 END) AS overdue_cash_orders
FROM courier_wallets cw
LEFT JOIN courier_transactions ct
  ON ct.courier_id = cw.courier_id
GROUP BY
  cw.id,
  cw.courier_id,
  cw.current_balance,
  cw.pending_debt_balance,
  cw.available_balance,
  cw.total_earned,
  cw.account_status,
  cw.grace_until,
  cw.critical_overdue_at;

-- ============================================================
-- END
-- ============================================================