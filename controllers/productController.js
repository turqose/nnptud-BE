const { Op } = require("sequelize");
const Product = require("../models/product");
const ProductImage = require("../models/productImage");
const { deleteFiles } = require("../utils/fileUpload");
const path = require("path");
const { Category, Review, User, ProductCategory } = require("../models");
const { sequelize } = require("../config/db");
const slugify = require("slugify");
const fs = require("fs");
// Validate product data
const validateProductData = (data) => {
  const { sku, name, brand, price } = data;
  if (!sku || !name || !brand || price === undefined) {
    throw new Error("Missing required fields: sku, name, brand, price");
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    validateProductData(req.body);
    if (!req.body.category_id) {
      throw new Error("Category ID is required");
    }
    const allCategories = await Category.findByPk(req.body.category_id);
    if (!allCategories) {
      throw new Error("Category not found");
    }

    if (!req.files || req.files.length === 0) {
      throw new Error("No files uploaded");
    }

    const product = await Product.create({
      ...req.body,
    });
    await ProductImage.bulkCreate(
      req.files.map((file) => ({
        product_id: product.product_id,
        url: file.path,
      })),
    );
    await product.addCategory(allCategories);

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// Get all products with pagination, search by name, and filter by price range
exports.getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    minPrice,
    maxPrice,
    categorySlug,
    sort,
  } = req.query;

  // Validate and parse pagination parameters
  const parsedPage = Math.max(parseInt(page) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

  // Build filter conditions
  const filters = {
    name: {
      [Op.like]: `%${search}%`,
    },
  };

  // Price filter
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) filters.price[Op.lte] = parseFloat(maxPrice);
  }

  // Sorting
  const sortOptions = {
    "price-asc": [["price", "ASC"]],
    "price-desc": [["price", "DESC"]],
    "name-asc": [["name", "ASC"]],
    "name-desc": [["name", "DESC"]],
    newest: [["created_at", "DESC"]],
    default: [["created_at", "DESC"]],
  };
  const order = sortOptions[sort] || sortOptions.default;

  // Category filter
  const categoryInclude = {
    model: Category,
    as: "categories",
    attributes: ["category_id", "name", "slug"],
    through: { attributes: [] }, // Hide junction table
  };
  if (categorySlug) {
    categoryInclude.where = { slug: categorySlug };
    categoryInclude.required = true;
  }
  try {
    const products = await Product.findAndCountAll({
      distinct: true, // Correct count with JOIN
      where: filters,
      offset: (parsedPage - 1) * parsedLimit,
      limit: parsedLimit,
      order,
      include: [
        {
          model: ProductImage,
          as: "images",
        },
        categoryInclude,
      ],
    });

    // Calculate totalRating for each product
    const productsWithRatings = await Promise.all(
      products.rows.map(async (product) => {
        const totalRating = await product.calculateTotalRating();
        return { ...product.toJSON(), totalRating };
      }),
    );

    res.status(200).json({
      total: products.count,
      pages: Math.ceil(products.count / limit),
      data: productsWithRatings,
    });
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// Get a single product by ID with related products
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductImage,
          as: "images",
        },
        {
          model: Category,
          as: "categories",
          attributes: ["category_id", "name", "slug"],
          through: { attributes: [] }, // Ensure the join table attributes are not included
        },
      ],
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const totalRating = await product.calculateTotalRating();

    const categoryIds = product.categories
      ? product.categories.map((category) => category.category_id)
      : [];

    const relatedProducts = await Product.findAll({
      include: [
        {
          model: Category,
          as: "categories",
          where: { category_id: categoryIds },
          attributes: [],
          through: { attributes: [] },
        },
        {
          model: ProductImage,
          as: "images",
        },
      ],
      where: {
        product_id: { [Op.ne]: product.product_id },
      },
      limit: 5,
    });

    res.status(200).json({ product, relatedProducts, totalRating });
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    validateProductData(req.body);
    const existingImages = req.body.existingImages || []; // Danh sách ảnh còn lại từ frontend (mảng URL)
    const imageOld = await ProductImage.findAll({
      where: {
        product_id: req.params.id,
      },
    });
    const imagesToDelete = imageOld.filter(
      (img) => !existingImages.includes(img.image_id),
    );

    for (const img of imagesToDelete) {
      await ProductImage.destroy({ where: { image_id: img.image_id } });

      const filePath = path.join(__dirname, "..", "uploads/products", img.url);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Lỗi khi xóa ảnh: ${img.url}`, err);
        }
      });
    }

    const [updated] = await Product.update(
      { ...req.body, rating: 0 },
      {
        where: { product_id: req.params.id },
      },
    );
    if (req.files.length > 0) {
      await ProductImage.bulkCreate(
        req.files.map((file) => ({
          product_id: req.params.id,
          url: file.path,
        })),
      );
    }
    if (req.body.category_id) {
      const category = await Category.findByPk(req.body.category_id);
      if (!category) {
        throw new Error("Category not found");
      }
      const product = await Product.findByPk(req.params.id);
      await product.setCategories([category]);
    }

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductImage,
          as: "images",
        },
        {
          model: Category,
          as: "categories",
          attributes: ["category_id", "name", "slug"],
        },
      ],
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const imageOld = await ProductImage.findAll({
      where: {
        product_id: req.params.id,
      },
    });

    const deleted = await Product.destroy({
      where: { product_id: req.params.id },
    });
    deleteFiles(
      imageOld.map((image) => path.join(__dirname, "../", image.url)),
    );

    await ProductImage.destroy({
      where: {
        product_id: req.params.id,
      },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(204).json();
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};
exports.bulkCreateProducts = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Validate dữ liệu đầu vào
    req.body.forEach((product) => {
      if (!product.category) {
        throw new Error("Category name is required for each product");
      }
      validateProductData(product);
    });

    // Lấy danh sách category names (unique)
    const categoryNames = [
      ...new Set(
        req.body.flatMap((p) =>
          p.category.split(",").map((name) => name.trim()),
        ),
      ),
    ];

    // Tìm hoặc tạo mới các category

    const categoryMap = new Map();
    for (const name of categoryNames) {
      try {
        const [category] = await Category.findOrCreate({
          where: { name },
          defaults: { slug: slugify(name, { lower: true }) },
          transaction,
        });
        categoryMap.set(name, category.dataValues.category_id);
      } catch (error) {
        await transaction.rollback();
        return res.status(400).json({ error: error.message });
      }
    }

    // Tạo các sản phẩm
    const productsData = req.body.map(({ category, ...rest }) => rest);
    const products = await Product.bulkCreate(productsData, {
      transaction,
      returning: true,
    });

    // Tạo liên kết product-category
    const productCategories = req.body.flatMap((p, index) => {
      return p.category.split(",").map((name) => ({
        product_id: products[index].product_id,
        category_id: categoryMap.get(name.trim()),
      }));
    });

    await ProductCategory.bulkCreate(productCategories, {
      transaction,
    });

    // Tạo các ảnh sản phẩm
    const productImages = req.body.flatMap((p, index) => {
      const imagesArray = p.images
        .replace(/\[|\]/g, "")
        .split(", ")
        .map((item) => item.replace(/'/g, ""));
      return imagesArray.map((image) => ({
        product_id: products[index].product_id,
        url: "uploads/" + image,
      }));
    });

    await ProductImage.bulkCreate(productImages, { transaction });
    await transaction.commit();
    res.status(201).json(products);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

// Bulk delete products
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid or empty ids array");
    }
    const deleted = await Product.destroy({
      where: { product_id: ids },
    });
    res.status(204).json({ deleted });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: ProductImage,
          as: "images",
        },
        {
          model: Category,
          as: "categories",
          attributes: ["category_id", "name", "slug"],
          through: { attributes: [] }, // Ensure the join table attributes are not included
        },
        {
          model: Review,
          as: "reviews",
          attributes: ["rating", "comment", "created_at"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "full_name", "email"],
            },
          ],
        },
      ],
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const totalRating = await product.calculateTotalRating();

    const categoryIds = product.categories
      ? product.categories.map((category) => category.category_id)
      : [];

    const relatedProducts = await Product.findAll({
      include: [
        {
          model: Category,
          as: "categories",
          where: { category_id: categoryIds },
          attributes: [],
          through: { attributes: [] },
        },
        {
          model: ProductImage,
          as: "images",
        },
      ],
      where: {
        product_id: { [Op.ne]: product.product_id },
      },
      limit: 5,
    });

    res.status(200).json({ product, relatedProducts, totalRating });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update product stock status
exports.updateStockStatus = async (req, res) => {
  try {
    const { stock_status } = req.body;
    const [updated] = await Product.update(
      { stock_status },
      {
        where: { product_id: req.params.id },
      },
    );
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    const updatedProduct = await Product.findByPk(req.params.id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// viết review cho product
exports.createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const { rating, content, product_id } = req.body;
    if (!rating || !content) {
      throw new Error("Missing required fields: rating, content");
    }

    // Check if the user has already reviewed this product
    const existingReview = await Review.findOne({
      where: {
        product_id: product_id,
        user_id: req.user.userId,
      },
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }

    const review = await Review.create({
      comment: content,
      rating,
      product_id: product_id,
      user_id: req.user.userId,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Apply discount to a product
exports.applyDiscount = async (req, res) => {
  try {
    const { discount } = req.body;
    const [updated] = await Product.update(
      { discount },
      {
        where: { product_id: req.params.id },
      },
    );
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    const updatedProduct = await Product.findByPk(req.params.id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      throw new Error("Missing search query");
    }
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            brand: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            sku: {
              [Op.iLike]: `%${q}%`,
            },
          },
        ],
      },
      include: [
        {
          model: ProductImage,
          as: "images",
        },
        {
          model: Category,
          as: "categories",
          attributes: ["category_id", "name", "slug"],
        },
      ],
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductImage,
          as: "images",
        },
        {
          model: Category,
          as: "categories",
          attributes: ["category_id", "name", "slug"],
        },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
