module.exports = (sequelize, DataTypes) => {
  const PaymentAttempt = sequelize.define(
    "PaymentAttempt",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      payment_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      result: {
        type: DataTypes.ENUM("SUCCESS", "FAILED"),
        allowNull: false
      },
      external_reference: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      response_code: {
        type: DataTypes.STRING(32),
        allowNull: true
      },
      response_message: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      request_payload: {
        type: DataTypes.JSON,
        allowNull: true
      },
      response_payload: {
        type: DataTypes.JSON,
        allowNull: true
      },
      request_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      correlation_id: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      origin_service: {
        type: DataTypes.STRING(50),
        allowNull: true
      }
    },
    {
      tableName: "payment_attempts",
      underscored: true,
      timestamps: true,
      updatedAt: false
    }
  );

  PaymentAttempt.associate = (models) => {
    PaymentAttempt.belongsTo(models.Payment, {
      foreignKey: "payment_id",
      as: "payment"
    });
  };

  return PaymentAttempt;
};