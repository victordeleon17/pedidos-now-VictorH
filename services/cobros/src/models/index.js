const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
        ca: process.env.DB_CA
          ? process.env.DB_CA.replace(/\\n/g, "\n")
          : undefined
      }
    }
  }
);

const PaymentMethodModel = require("./paymentMethod.model");
const PaymentStatusModel = require("./paymentStatus.model");
const CouponModel = require("./coupon.model");
const OrderSnapshotModel = require("./orderSnapshot.model");
const OrderItemSnapshotModel = require("./orderItemSnapshot.model");
const PaymentModel = require("./payment.model");
const PaymentAttemptModel = require("./paymentAttempt.model");
const PaymentDiscountAppliedModel = require("./paymentDiscountApplied.model");
const RefundModel = require("./refund.model");
const CourierWalletModel = require("./courierWallet.model");
const CourierTransactionModel = require("./courierTransaction.model");
const WalletSettlementModel = require("./walletSettlement.model");
const WalletWithdrawalModel = require("./walletWithdrawal.model");
const WalletAdjustmentModel = require("./walletAdjustment.model");

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.PaymentMethodModel = PaymentMethodModel;
db.PaymentStatusModel = PaymentStatusModel;
db.CouponModel = CouponModel;
db.OrderSnapshotModel = OrderSnapshotModel;
db.OrderItemSnapshotModel = OrderItemSnapshotModel;
db.PaymentModel = PaymentModel;
db.PaymentAttemptModel = PaymentAttemptModel;
db.PaymentDiscountAppliedModel = PaymentDiscountAppliedModel;
db.RefundModel = RefundModel;
db.CourierWalletModel = CourierWalletModel;
db.CourierTransactionModel = CourierTransactionModel;
db.WalletSettlementModel = WalletSettlementModel;
db.WalletWithdrawalModel = WalletWithdrawalModel;
db.WalletAdjustmentModel = WalletAdjustmentModel;

module.exports = db;