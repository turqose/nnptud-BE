const { Product } = require("../models");
const Category = require("../models/category");
const { deleteFile } = require("../utils/fileUpload");

// Validate category data
const validateCategoryData = (data) => {
  const { name, slug } = data;
  if (!name || !slug) {
    throw new Error("Missing required fields: name, slug");
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    validateCategoryData(req.body);
    if (req.file) {
      req.body.image = req.file.path;
    }
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Get all categories with pagination
exports.getCategories = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const categories = await Category.findAndCountAll({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["product_id"],
        },
      ],
    });
    res.status(200).json({
      total: categories.count,
      pages: Math.ceil(categories.count / limit),
      data: categories.rows,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
  try {
    console.log(req.body);
    validateCategoryData(req.body);
    if (req.file) {
      req.body.image = req.file.path;
    }
    const [updated] = await Category.update(req.body, {
      where: { category_id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ error: "Category not found" });
    }
    const updatedCategory = await Category.findByPk(req.params.id);
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error); // Log the entire error object for debugging
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    deleteFile(category.image);
    await Category.destroy({
      where: { category_id: req.params.id },
    });
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Bulk create categories
exports.bulkCreateCategories = async (req, res) => {
  try {
    req.body.forEach(validateCategoryData);
    const categories = await Category.bulkCreate(req.body);
    res.status(201).json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Bulk delete categories
exports.bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid or empty ids array");
    }
    const deleted = await Category.destroy({
      where: { category_id: ids },
    });
    res.status(204).json({ deleted });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
