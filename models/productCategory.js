const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");
const Product = require("./product");
const Category = require("./category");

const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: Product,
        key: "product_id",
      },
      onDelete: "CASCADE",
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "category_id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "product_categories",
    timestamps: false,
    primaryKey: true,
  },
);

module.exports = ProductCategory;
