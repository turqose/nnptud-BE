const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const VariantType = require("./variantType");

const Variant = sequelize.define("variant", {
  variant_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  sku: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  variant_type_id: {
    type: DataTypes.UUID,
    references: {
      model: VariantType,
      key: "variant_type_id",
    },
    onDelete: "SET NULL",
  },
});

module.exports = Variant;
