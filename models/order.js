const { DataTypes } = require("sequelize");
const User = require("./user");
const { sequelize } = require("./../config/db");
const Address = require("./address");

const Order = sequelize.define(
  "Order",
  {
    order_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "user_id",
      },
      onDelete: "SET NULL",
    },
    address_id: {
      type: DataTypes.UUID,
      references: {
        model: Address,
        key: "address_id",
      },
      onDelete: "SET NULL",
    },
    shipping: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING(20), // Ví dụ: "pending", "paid", "failed"
      defaultValue: "Pending",
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
  },
);

module.exports = Order;
