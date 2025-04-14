const { Variant } = require("../models");

const { VariantType } = require("../models");

const validateVariantData = (data) => {
  if (!data.name) {
    throw new Error("Name is required");
  }
  if (!data.variant_type_id) {
    throw new Error("Variant type is required");
  }
};

exports.getAllVariant = async (req, res) => {
  try {
    const variants = await Variant.findAll({
      include: [
        {
          model: VariantType,
          as: "variantType",
          attributes: ["name"],
        },
      ],
    });
    res.status(200).json(variants);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getVariantById = async (req, res) => {
  try {
    const variant = await Variant.findByPk(req.params.id, {
      include: [
        {
          model: VariantType,
          as: "variantType",
          attributes: ["name"],
        },
      ],
    });
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    res.status(200).json(variant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createVariant = async (req, res) => {
  try {
    validateVariantData(req.body);
    const variant = await Variant.create(req.body);
    res.status(201).json(variant);
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.updateVariant = async (req, res) => {
  try {
    validateVariantData(req.body);
    const variant = await Variant.findByPk(req.params.id);
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    await variant.update(req.body);
    res.status(200).json(variant);
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.deleteVariant = async (req, res) => {
  try {
    const variant = await Variant.findByPk(req.params.id);
    if (!variant) {
      return res.status(404).json({ error: "Variant not found" });
    }
    await variant.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
