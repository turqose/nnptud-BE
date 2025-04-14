const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const Order = require("./order");
const Product = require("./product");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    order_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.UUID,
      references: {
        model: Order,
        key: "order_id",
      },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: Product,
        key: "product_id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    timestamps: false,
  },
);

module.exports = OrderItem;
