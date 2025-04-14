const { VariantType } = require("../models");

const validateVariantTypeData = (data) => {
  if (!data.name) {
    throw new Error("Name is required");
  }
};

exports.getAllVariantTypes = async (req, res) => {
  try {
    const variantTypes = await VariantType.findAll();
    res.status(200).json(variantTypes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getVariantTypeById = async (req, res) => {
  try {
    const variantType = await VariantType.findByPk(req.params.id);
    if (!variantType) {
      return res.status(404).json({ error: "Variant type not found" });
    }
    res.status(200).json(variantType);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createVariantType = async (req, res) => {
  try {
    validateVariantTypeData(req.body);
    const variantType = await VariantType.create(req.body);
    res.status(201).json(variantType);
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.updateVariantType = async (req, res) => {
  try {
    validateVariantTypeData(req.body);
    const variantType = await VariantType.findByPk(req.params.id);
    if (!variantType) {
      return res.status(404).json({ error: "Variant type not found" });
    }
    await variantType.update(req.body);
    res.status(200).json(variantType);
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.deleteVariantType = async (req, res) => {
  try {
    const variantType = await VariantType.findByPk(req.params.id);
    if (!variantType) {
      return res.status(404).json({ error: "Variant type not found" });
    }
    await variantType.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
