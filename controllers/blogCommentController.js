const { User } = require("../models");
const BlogComment = require("../models/blogComment");

exports.createBlogComment = async (req, res) => {
  try {
    validateBlogCommentData(req.body);
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    req.body.user_id = req.user.userId;
    const userData = await User.findByPk(req.user.userId);
    if (!userData) {
      throw new Error("User not found");
    }
    req.body.user_name = userData.name;
    const comment = await BlogComment.create(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBlogComments = async (req, res) => {
  try {
    const { post_id } = req.params;
    const comments = await BlogComment.findAll({
      where: { post_id },
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBlogComment = async (req, res) => {
  try {
    const comment = await BlogComment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    await comment.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
