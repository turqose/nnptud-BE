const { DataTypes } = require("sequelize");
const { sequelize } = require("./../config/db");

const Product = sequelize.define(
  "Product",
  {
    product_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    sku: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0,
      },
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    stock_status: {
      type: DataTypes.ENUM("in_stock", "out_of_stock", "pre_order"),
      defaultValue: "in_stock",
    },
    description: {
      type: DataTypes.TEXT,
    },
    ingredients: {
      type: DataTypes.JSON,
    },
    expiryDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    manufacturingDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    origin: {
      type: DataTypes.TEXT,
    },
    adverseeffect: {
      type: DataTypes.TEXT,
    },
    dosage: {
      type: DataTypes.TEXT,
    },
    usage: {
      type: DataTypes.TEXT,
    },

    careful: {
      type: DataTypes.TEXT,
    },

    preservation: {
      type: DataTypes.TEXT,
    },
    inventory: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    tableName: "products",
    timestamps: false,
  },
);

Product.prototype.calculateTotalRating = async function () {
  const reviews = await this.getReviews();
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length || 0;
};

module.exports = Product;
