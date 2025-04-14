const { sequelize } = require("./../config/db");
const { DataTypes } = require("sequelize");
const ProductView = sequelize.define(
  "productView",
  {
    product_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    view_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "product_view",
    timestamps: false,
  },
);

module.exports = ProductView;
