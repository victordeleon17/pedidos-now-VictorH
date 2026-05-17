module.exports = (sequelize, DataTypes) => {
  const CourierWallet = sequelize.define(
    "CourierWallet",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      courier_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
      },
      current_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      pending_debt_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      available_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_earned: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      account_status: {
        type: DataTypes.ENUM("ACTIVE", "BLOCKED"),
        allowNull: false,
        defaultValue: "ACTIVE"
      },
      grace_until: {
        type: DataTypes.DATE,
        allowNull: true
      },
      critical_overdue_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      blocked_reason: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      tableName: "courier_wallets",
      underscored: true,
      timestamps: true
    }
  );

  CourierWallet.associate = () => {};

  return CourierWallet;
};