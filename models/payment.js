const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const Order = require("./order");

const Payment = sequelize.define(
  "Payment",
  {
    payment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    order_id: {
      type: DataTypes.UUID,
      references: {
        model: Order,
        key: "order_id",
      },
      onDelete: "CASCADE",
    },
    payment_method: {
      type: DataTypes.STRING(50), // Ví dụ: "credit_card", "paypal", "cod"
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20), // Ví dụ: "pending", "completed", "failed"
      defaultValue: "pending",
    },
    transaction_id: {
      type: DataTypes.STRING(100), // ID giao dịch từ cổng thanh toán
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payments",
    timestamps: false,
  },
);

module.exports = Payment;
