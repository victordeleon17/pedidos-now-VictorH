module.exports = (sequelize, DataTypes) => {
  const CourierTransaction = sequelize.define(
    "CourierTransaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      courier_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      payment_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      order_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      order_snapshot_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM("CREDIT", "DEBIT"),
        allowNull: false
      },
      transaction_category: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      payment_method_code: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      order_total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      courier_earned_fee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      previous_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      new_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      resulting_signed_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      settlement_status: {
        type: DataTypes.ENUM("NOT_APPLICABLE", "PENDING", "SETTLED", "OVERDUE"),
        allowNull: false,
        defaultValue: "NOT_APPLICABLE"
      },
      due_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      settled_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      can_pay_pending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      external_bank_reference: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: "courier_transactions",
      underscored: true,
      timestamps: true,
      updatedAt: false
    }
  );

  CourierTransaction.associate = (models) => {
    CourierTransaction.belongsTo(models.Payment, {
      foreignKey: "payment_id",
      as: "payment"
    });
  };

  return CourierTransaction;
};