const { User } = require("../models");
const BlogCategory = require("../models/blogCategory");
const BlogPost = require("../models/blogPost");
const { deleteFile } = require("../utils/fileUpload");

const validateBlogData = (data) => {
  const { title, content, category_id } = data;
  if (!title || !content || !category_id) {
    throw new Error("Missing required fields: title, content, category_id");
  }
};
exports.getAllTags = async (req, res) => {
  try {
    const tags = await BlogPost.findAll({
      attributes: ["tags"],
    });
    // Extract and flatten tags
    const tagsArray = tags.map((tag) => JSON.parse(tag.tags)).flat();
    res.status(200).json(tagsArray);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get a post recently added
exports.getRecentPost = async (req, res) => {
  try {
    const post = await BlogPost.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllBlog = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const blogs = await BlogPost.findAndCountAll({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      include: [
        {
          model: BlogCategory,
          as: "category",
          attributes: ["name", "category_id"],
        },
        {
          model: User,
          attributes: ["full_name"],
        },
      ],
    });
    res.status(200).json({
      total: blogs.count,
      pages: Math.ceil(blogs.count / limit),
      data: blogs.rows,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await BlogPost.findByPk(req.params.id, {
      include: [
        {
          model: BlogCategory,
          as: "category",
          attributes: ["name", "category_id"],
        },
        {
          model: User,
          attributes: ["full_name"],
        },
      ],
    });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createBlog = async (req, res) => {
  try {
    validateBlogData(req.body);
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    req.body.author_id = req.user.userId;
    const userData = await User.findByPk(req.user.userId);
    if (!userData) {
      throw new Error("User not found");
    }
    req.body.authorName = userData.full_name;
    if (req.file) {
      req.body.image = req.file.path;
    }

    const blog = await BlogPost.create(req.body);
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    validateBlogData(req.body);
    const blog = await BlogPost.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    if (req.file) {
      deleteFile(blog.image);
      req.body.image = req.file.path;
    }
    const [updated] = await BlogPost.update(req.body, {
      where: { post_id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ error: "Blog not found" });
    }
    const updatedBlog = await BlogPost.findByPk(req.params.id);
    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error(error); // Log the entire error object for debugging
    res.status(400).json({
      error: error.errors ? error.errors.map((e) => e.message) : error.message,
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const blog = await BlogPost.findOne({
      where: { post_id: req.params.id, author_id: req.user.userId },
    });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    deleteFile(blog.image);
    await BlogPost.destroy({
      where: { post_id: req.params.id },
    });
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
