const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const VariantType = sequelize.define("variantType", {
  variant_type_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

module.exports = VariantType;
