const { BlogPost } = require("../models");
const BlogCategory = require("../models/blogCategory");
const validateBlogCategoryData = (data) => {
  const { name } = data;
  if (!name) {
    throw new Error("Missing required fields: name");
  }
};
exports.createBlogCategory = async (req, res) => {
  try {
    validateBlogCategoryData(req.body);
    const category = await BlogCategory.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBlogCategories = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const categories = await BlogCategory.findAndCountAll({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      include: [
        {
          model: BlogPost,
          as: "posts",
          attributes: ["post_id"],
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

exports.getBlogCategoryById = async (req, res) => {
  try {
    const category = await BlogCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateBlogCategory = async (req, res) => {
  try {
    validateBlogCategoryData(req.body);
    const category = await BlogCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    await category.update(req.body);
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBlogCategory = async (req, res) => {
  try {
    const category = await BlogCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    await category.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// tạo nhiều category 1 lúc
exports.createBulkBlogCategories = async (req, res) => {
  try {
    const categories = req.body.map((category) => {
      validateBlogCategoryData(category);
      return category;
    });
    const createdCategories = await BlogCategory.bulkCreate(categories);
    res.status(201).json(createdCategories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
