const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const Product = require("./product");

const ProductInteraction = sequelize.define(
  "ProductInteraction",
  {
    interaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: Product,
        key: "product_id",
      },
      onDelete: "CASCADE",
    },
    conflicting_with: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    severity: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "product_interactions",
    timestamps: false,
  },
);

module.exports = ProductInteraction;
